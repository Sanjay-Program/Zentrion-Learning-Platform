/** Browser-side API helper with CSRF handling. */
export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const csrf = document.cookie
    .split("; ")
    .find((c) => c.startsWith("zcsrftoken="))
    ?.split("=")[1];

  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
  };
  if (csrf) headers["x-csrf-token"] = csrf;
  if (init.body && typeof init.body === "string") {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(path, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { error?: { message?: string } })?.error?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}
