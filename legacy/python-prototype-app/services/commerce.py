"""Commerce: checkout, webhook verification, entitlements.

Entitlements are granted ONLY from verified payment events — never
from client-supplied success URLs. Webhook processing is idempotent.
"""
from __future__ import annotations

import hashlib
import hmac
import json
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.config import get_settings
from app.core.audit import audit
from app.core.errors import ConflictError, ExternalServiceError, NotFoundError, PaymentRequiredError, ValidationError
from app.models.commerce import (
    Coupon,
    Entitlement,
    Order,
    OrderItem,
    OrderStatus,
    PaymentAttempt,
    PaymentEvent,
    Price,
    Product,
    RefundRequest,
    Subscription,
    WebhookEvent,
)
from app.models.identity import User
from app.services.enrollment import enroll as enroll_course


def create_checkout_session(
    db: Session,
    user: User,
    *,
    product_id: int,
    price_id: int,
    coupon_code: Optional[str] = None,
    success_url: str,
    cancel_url: str,
) -> dict:
    product = db.query(Product).filter(Product.id == product_id, Product.is_active.is_(True)).first()
    if not product:
        raise NotFoundError("Product not found")
    price = db.query(Price).filter(Price.id == price_id, Price.product_id == product.id, Price.is_active.is_(True)).first()
    if not price:
        raise NotFoundError("Price not found")

    amount = price.amount_cents
    applied_coupon = None
    if coupon_code:
        coupon = db.query(Coupon).filter(Coupon.code == coupon_code.upper(), Coupon.is_active.is_(True)).first()
        now = datetime.now(timezone.utc)
        if not coupon:
            raise ValidationError("Invalid coupon code")
        if coupon.expires_at and coupon.expires_at < now:
            raise ValidationError("Coupon has expired")
        if coupon.max_uses is not None and coupon.use_count >= coupon.max_uses:
            raise ValidationError("Coupon usage limit reached")
        if coupon.discount_type == "percent":
            amount = max(0, amount - (amount * coupon.discount_value // 100))
        else:
            amount = max(0, amount - coupon.discount_value)
        applied_coupon = coupon

    order = Order(
        user_id=user.id,
        status=OrderStatus.PENDING,
        total_cents=amount,
        currency=price.currency,
        provider="stripe" if get_settings().payments_configured else "manual",
        coupon_code=applied_coupon.code if applied_coupon else None,
    )
    db.add(order)
    db.flush()
    db.add(OrderItem(order_id=order.id, product_id=product.id, price_id=price.id, amount_cents=amount, currency=price.currency))

    settings = get_settings()
    provider_session_id = None
    checkout_url = None

    if settings.payments_configured:
        provider_session_id, checkout_url = _create_stripe_checkout(
            db, user, product, price, amount, success_url, cancel_url
        )
        db.add(
            PaymentAttempt(
                order_id=order.id,
                provider="stripe",
                provider_intent_id=provider_session_id,
                status="initiated",
                amount_cents=amount,
                currency=price.currency,
            )
        )
    else:
        # No provider configured: do NOT grant access. Show the setup state.
        checkout_url = None

    if applied_coupon:
        applied_coupon.use_count += 1

    db.commit()
    audit(db, "checkout.started", actor=user, entity_type="order", entity_id=order.id)
    return {
        "order_id": order.id,
        "amount_cents": amount,
        "currency": price.currency,
        "provider": order.provider,
        "provider_session_id": provider_session_id,
        "checkout_url": checkout_url,
        "requires_provider_setup": not settings.payments_configured,
    }


def _create_stripe_checkout(
    db: Session,
    user: User,
    product: Product,
    price: Price,
    amount_cents: int,
    success_url: str,
    cancel_url: str,
) -> tuple[str, str]:
    import httpx

    settings = get_settings()
    payload = {
        "line_items": [
            {
                "price_data": {
                    "currency": price.currency.lower(),
                    "unit_amount": amount_cents,
                    "product_data": {"name": product.name},
                },
                "quantity": 1,
            }
        ],
        "mode": "payment",
        "success_url": success_url,
        "cancel_url": cancel_url,
        "metadata": {"order_id": str(0)},  # filled below
    }
    try:
        resp = httpx.post(
            "https://api.stripe.com/v1/checkout/sessions",
            headers={"Authorization": f"Bearer {settings.stripe_secret_key}"},
            data={k: v for k, v in payload.items() if k != "metadata"},
            timeout=30.0,
        )
    except httpx.HTTPError as exc:
        raise ExternalServiceError(f"Payment provider unreachable: {exc}") from exc
    if resp.status_code >= 400:
        raise ExternalServiceError("Payment provider rejected the checkout request")
    data = resp.json()
    return data["id"], data["url"]


def verify_stripe_webhook(payload: bytes, signature: str) -> Optional[dict]:
    """Verify the Stripe webhook signature. Returns the event or None."""
    settings = get_settings()
    if not settings.stripe_webhook_secret:
        return None
    try:
        timestamp, signatures = _parse_stripe_signature(signature)
        signed_payload = f"{timestamp}.{payload.decode('utf-8')}"
        expected = hmac.new(
            settings.stripe_webhook_secret.encode("utf-8"),
            signed_payload.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        for sig in signatures:
            if hmac.compare_digest(f"v1={expected}", sig):
                # Reject replays older than 5 minutes.
                if abs(datetime.now(timezone.utc).timestamp() - int(timestamp)) > 300:
                    return None
                return json.loads(payload.decode("utf-8"))
    except (ValueError, KeyError):
        return None
    return None


def _parse_stripe_signature(signature: str) -> tuple[str, list[str]]:
    parts = dict(p.split("=", 1) for p in signature.split(","))
    return parts["t"], parts["v1"].split(",")


def process_payment_event(db: Session, provider: str, event_id: str, event_type: str, payload: dict) -> bool:
    """Idempotent webhook processing. Returns True if newly processed."""
    existing = (
        db.query(WebhookEvent)
        .filter(WebhookEvent.provider == provider, WebhookEvent.event_id == event_id)
        .first()
    )
    if existing:
        return False
    event = WebhookEvent(
        provider=provider,
        event_id=event_id,
        event_type=event_type,
        payload=json.dumps(payload) if payload else None,
        signature_valid=True,
        processed=False,
    )
    db.add(event)
    db.flush()

    if event_type == "checkout.session.completed":
        _handle_checkout_completed(db, payload)
    elif event_type in ("customer.subscription.created", "customer.subscription.updated"):
        _handle_subscription_event(db, payload)
    event.processed = True
    event.processed_at = datetime.now(timezone.utc)
    db.commit()
    return True


def _handle_checkout_completed(db: Session, payload: dict) -> None:
    provider_session_id = payload.get("id")
    attempt = db.query(PaymentAttempt).filter(PaymentAttempt.provider_intent_id == provider_session_id).first()
    if not attempt:
        return
    order = db.query(Order).filter(Order.id == attempt.order_id).first()
    if not order or order.status == OrderStatus.PAID:
        return
    attempt.status = "succeeded"
    order.status = OrderStatus.PAID
    order.paid_at = datetime.now(timezone.utc)
    db.add(
        PaymentEvent(
            provider="stripe",
            event_id=payload.get("id", ""),
            event_type="checkout.session.completed",
            payload=json.dumps(payload),
            processed=True,
            processed_at=datetime.now(timezone.utc),
        )
    )
    # Grant entitlement exactly once, only after verified payment.
    from app.models.catalogue import Course

    user = db.query(User).filter(User.id == order.user_id).first()
    for item in order.items:
        reference_id = item.product.reference_id or 0
        db.query(Entitlement).filter(
            Entitlement.user_id == order.user_id,
            Entitlement.resource_type == "course",
            Entitlement.resource_id == reference_id,
        ).delete(synchronize_session=False)
        db.add(
            Entitlement(
                user_id=order.user_id,
                resource_type="course",
                resource_id=reference_id,
                source="purchase",
                order_id=order.id,
            )
        )
        course = db.query(Course).filter(Course.id == reference_id).first()
        if user and course and course.is_published:
            try:
                enroll_course(db, user, course, source="purchase")
            except Exception:  # noqa: BLE001 - already enrolled is acceptable
                pass
    db.commit()
    audit(db, "payment.succeeded", entity_type="order", entity_id=order.id, details={"amount_cents": order.total_cents})


def _handle_subscription_event(db: Session, payload: dict) -> None:
    sub_id = payload.get("id")
    user_email = (payload.get("customer") or "")
    status_map = {"active": "active", "past_due": "past_due", "canceled": "cancelled"}
    status = status_map.get(payload.get("status"), "active")
    sub = db.query(Subscription).filter(Subscription.provider_subscription_id == sub_id).first()
    if sub:
        sub.status = status
        if payload.get("current_period_end"):
            sub.current_period_ends = datetime.fromtimestamp(payload["current_period_end"], tz=timezone.utc)
    db.commit()


def request_refund(db: Session, user: User, order_id: int, reason: str) -> RefundRequest:
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user.id).first()
    if not order:
        raise NotFoundError("Order not found")
    if order.status != OrderStatus.PAID:
        raise ValidationError("Only paid orders can be refunded")
    request = RefundRequest(order_id=order.id, user_id=user.id, reason=reason)
    db.add(request)
    db.commit()
    audit(db, "refund.requested", actor=user, entity_type="order", entity_id=order.id)
    return request


def list_orders(db: Session, user: User) -> list[Order]:
    return db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).all()


def get_order(db: Session, user: User, order_id: int) -> Order:
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user.id).first()
    if not order:
        raise NotFoundError("Order not found")
    return order


def product_catalogue(db: Session) -> list[Product]:
    return db.query(Product).filter(Product.is_active.is_(True)).all()
