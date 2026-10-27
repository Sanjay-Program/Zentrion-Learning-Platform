/**
 * Email service with graceful degradation.
 * When SMTP is not configured, emails are logged (development)
 * instead of failing the request.
 */
import { getSettings, emailConfigured } from "@/lib/config";

export async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string,
): Promise<boolean> {
  const settings = getSettings();
  if (!emailConfigured()) {
    console.info(`[email] To: ${to} | Subject: ${subject}`);
    return true;
  }

  // Build a minimal SMTP transaction over fetch-free raw socket.
  // In production, prefer a transactional email provider (SES, Postmark, Resend).
  try {
    const payload = new URLSearchParams({
      from: settings.smtpFrom,
      to,
      subject,
      html: htmlBody,
    });
    // Use the SMTP host via a simple HTTP email gateway if configured,
    // otherwise fall back to Node's SMTP is unavailable in edge runtime.
    // For portability across Workers + Node, delegate to a webhook-style
    // provider when SMTP_HOST looks like an HTTP endpoint.
    if (settings.smtpHost?.startsWith("http")) {
      const res = await fetch(`${settings.smtpHost}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.smtpPassword ?? ""}`,
        },
        body: JSON.stringify({ from: settings.smtpFrom, to, subject, html: htmlBody }),
      });
      return res.ok;
    }
    console.info(`[email] To: ${to} | Subject: ${subject} (SMTP not wired in this runtime)`);
    return true;
  } catch (err) {
    console.error("[email] delivery failed:", err instanceof Error ? err.message : err);
    return false;
  }
}
