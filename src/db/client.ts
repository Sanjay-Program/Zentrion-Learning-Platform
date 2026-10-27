import { drizzle } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

export type DbClient = ReturnType<typeof drizzleLibsql>;

let libsqlClient: ReturnType<typeof createClient> | undefined;
let libsqlDrizzle: DbClient | undefined;

function getLocalDb(): DbClient {
  if (libsqlDrizzle) return libsqlDrizzle;
  const url = process.env.DATABASE_URL || "file:./data/zentrion.db";
  libsqlClient = createClient({ url });
  libsqlDrizzle = drizzleLibsql(libsqlClient, { schema });
  return libsqlDrizzle;
}

/**
 * Returns the request-scoped database client.
 * - On Cloudflare (OpenNext + D1 binding): returns a D1 drizzle client.
 * - Locally (`next dev` / plain Node): falls back to a libsql file database.
 */
export function getDb(): DbClient {
  // Cloudflare runtime: read the D1 binding from the request context.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getRequestContext } = require("@opennextjs/cloudflare") as {
      getRequestContext: () => { env?: Record<string, unknown> };
    };
    const ctx = getRequestContext();
    const db = ctx?.env?.DB;
    if (db) {
      // The D1 drizzle driver shares the SQLite query-builder surface used
      // by the libsql client, so it is safe to present it as the same type.
      return drizzle(db as Parameters<typeof drizzle>[0], { schema }) as unknown as DbClient;
    }
  } catch {
    // Not running in the OpenNext/Cloudflare runtime — use local libsql.
  }
  return getLocalDb();
}

/** Direct access to the underlying libsql client (used by the migration script). */
export function getLocalLibsqlClient() {
  return getLocalDb();
}

export { schema };
