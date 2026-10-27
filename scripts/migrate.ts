/**
 * Local database migration script.
 * Applies the Drizzle-generated SQL migrations to the local libsql file DB.
 * Production (D1) migrations are applied with: wrangler d1 migrations apply zention-db
 *
 * Usage: npm run db:migrate
 */
import { createClient } from "@libsql/client";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const migrationsDir = resolve(process.cwd(), "drizzle");
const dbUrl = process.env.DATABASE_URL || "file:./data/zentrion.db";

/** Split a drizzle migration file into individual statements. */
function splitStatements(sql: string): string[] {
  return sql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => (s.endsWith(";") ? s.slice(0, -1) : s));
}

async function main() {
  const client = createClient({ url: dbUrl });

  // Ensure the migration tracking table exists.
  await client.execute(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  const { rows: applied } = await client.execute("SELECT hash FROM __drizzle_migrations");
  const appliedHashes = new Set((applied as unknown as { hash: string }[]).map((r) => r.hash));

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const hash = file.replace(".sql", "").split("_")[0];
    if (appliedHashes.has(hash)) continue;
    const sql = readFileSync(resolve(migrationsDir, file), "utf-8");
    const statements = splitStatements(sql);
    // Apply all statements in one batch (atomic on the local driver).
    await client.batch([
      ...statements.map((statement) => ({ sql: statement, args: [] })),
      {
        sql: "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
        args: [hash, Date.now()],
      },
    ]);
    console.log(`✓ applied ${file} (${statements.length} statements)`);
  }

  console.log("Migration complete.");
  client.close();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
