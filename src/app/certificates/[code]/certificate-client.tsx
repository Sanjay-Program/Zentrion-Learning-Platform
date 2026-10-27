"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/webclient";
import { Button, Card, Field, Input } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

interface CertificateInfo {
  id: number;
  verificationCode: string;
  issuedAt: string;
  revoked: boolean;
  revokedReason: string | null;
  courseTitle: string;
  courseSlug: string;
  userId: number;
}

/** Certificate verification form and result. */
export function CertificateClient() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") ?? "";
  const [code, setCode] = useState(initialCode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CertificateInfo | null>(null);

  const verify = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiFetch<{ certificate: CertificateInfo }>(
        `/api/v1/certificates/${encodeURIComponent(code.trim())}`,
      );
      setResult(res.certificate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card raised>
      <form onSubmit={verify}>
        <Field label="Verification code" htmlFor="certificate-code" required
          hint="Found on the certificate, e.g. ZNT-ABCD-1234-EF56">
          <Input
            id="certificate-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ZNT-..."
            autoComplete="off"
          />
        </Field>
        <Button type="submit" disabled={busy || !code.trim()}>
          {busy ? "Verifying…" : "Verify"}
        </Button>
      </form>

      {error && (
        <p role="alert" style={{ color: "var(--danger)", marginTop: "var(--space-4)" }}>
          {error}
        </p>
      )}

      {result && (
        <div
          style={{
            marginTop: "var(--space-6)",
            padding: "var(--space-6)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            background: "var(--surface-2, var(--border))",
          }}
        >
          <div className="flex justify-between items-start" style={{ gap: "var(--space-3)", flexWrap: "wrap" }}>
            <div>
              <p className="text-muted text-sm">Certificate of completion</p>
              <h2 style={{ margin: "var(--space-1) 0" }}>{result.courseTitle}</h2>
              <p className="text-muted text-sm">
                Issued {formatDateTime(result.issuedAt)}
              </p>
            </div>
            <span className={result.revoked ? "badge badge-danger" : "badge badge-success"}>
              {result.revoked ? "Revoked" : "Valid"}
            </span>
          </div>
          <p className="text-muted text-sm" style={{ margin: "var(--space-4) 0 0" }}>
            Verification code: <code>{result.verificationCode}</code>
          </p>
          {result.revoked && result.revokedReason && (
            <p style={{ color: "var(--danger)", marginTop: "var(--space-2)" }}>
              {result.revokedReason}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
