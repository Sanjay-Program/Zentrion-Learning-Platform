/**Validated environment configuration. */
export interface Settings {
  appEnv: "development" | "testing" | "staging" | "production";
  appSecretKey: string;
  appBaseUrl: string;
  databaseUrl: string;
  sessionCookieAgeDays: number;
  smtpHost: string | null;
  smtpPort: number;
  smtpUsername: string | null;
  smtpPassword: string | null;
  smtpFrom: string;
  aiProvider: string;
  aiBaseUrl: string;
  aiApiKey: string | null;
  aiDefaultModel: string;
  aiEmbeddingModel: string;
  aiMaxTokensPerDay: number;
  stripeSecretKey: string | null;
  stripePublishableKey: string | null;
  stripeWebhookSecret: string | null;
  storageBackend: string;
  labExecutor: string;
  labMaxSessionMinutes: number;
}

function env(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

function envNum(name: string, fallback: number): number {
  const v = Number(process.env[name]);
  return Number.isFinite(v) ? v : fallback;
}

let cached: Settings | undefined;

export function getSettings(): Settings {
  if (cached) return cached;
  cached = {
    appEnv: (env("APP_ENV", "development") as Settings["appEnv"]),
    appSecretKey: env("APP_SECRET_KEY", "dev-secret-change-me"),
    appBaseUrl: env("APP_BASE_URL", "http://localhost:3000"),
    databaseUrl: env("DATABASE_URL", "file:./data/zentrion.db"),
    sessionCookieAgeDays: envNum("SESSION_COOKIE_AGE_DAYS", 30),
    smtpHost: env("SMTP_HOST") || null,
    smtpPort: envNum("SMTP_PORT", 587),
    smtpUsername: env("SMTP_USERNAME") || null,
    smtpPassword: env("SMTP_PASSWORD") || null,
    smtpFrom: env("SMTP_FROM", "Zentrion Learntech <noreply@example.com>"),
    aiProvider: env("AI_PROVIDER", "none"),
    aiBaseUrl: env("AI_BASE_URL", "https://api.openai.com/v1"),
    aiApiKey: env("AI_API_KEY") || null,
    aiDefaultModel: env("AI_DEFAULT_MODEL", "gpt-4o-mini"),
    aiEmbeddingModel: env("AI_EMBEDDING_MODEL", "text-embedding-3-small"),
    aiMaxTokensPerDay: envNum("AI_MAX_TOKENS_PER_DAY", 50000),
    stripeSecretKey: env("STRIPE_SECRET_KEY") || null,
    stripePublishableKey: env("STRIPE_PUBLISHABLE_KEY") || null,
    stripeWebhookSecret: env("STRIPE_WEBHOOK_SECRET") || null,
    storageBackend: env("STORAGE_BACKEND", "local"),
    labExecutor: env("LAB_EXECUTOR", "simulated"),
    labMaxSessionMinutes: envNum("LAB_MAX_SESSION_MINUTES", 120),
  };
  return cached;
}

export function isProduction(): boolean {
  return getSettings().appEnv === "production";
}

/** True when an OpenAI-compatible AI provider is fully configured. */
export function aiConfigured(): boolean {
  const s = getSettings();
  return s.aiProvider !== "none" && !!s.aiApiKey && !!s.aiBaseUrl;
}

/** True when Stripe checkout + webhook verification are configured. */
export function paymentsConfigured(): boolean {
  const s = getSettings();
  return !!s.stripeSecretKey && !!s.stripeWebhookSecret;
}

/** True when SMTP delivery is configured (otherwise email is logged). */
export function emailConfigured(): boolean {
  const s = getSettings();
  return !!s.smtpHost && !!s.smtpUsername;
}

export function validateStartup(): string[] {
  const s = getSettings();
  const problems: string[] = [];
  if (s.appEnv === "production") {
    if (!s.appSecretKey || s.appSecretKey.startsWith("change-me") || s.appSecretKey === "dev-secret-change-me") {
      problems.push("APP_SECRET_KEY must be a strong random value in production");
    }
    if (s.databaseUrl.startsWith("file:")) {
      problems.push("File-based SQLite is for development only; configure D1 in production");
    }
  }
  return problems;
}
