import { customType } from "drizzle-orm/sqlite-core";

/**
 * JSON column for SQLite.
 *
 * drizzle-orm's sqlite-core has no `json` column type, so this custom
 * type stores serialized JSON in a TEXT column while exposing the native
 * TypeScript type at the application boundary:
 *
 *   interests: json<string[]>()("interests").notNull().default([])
 *
 * `toDriver` serializes on insert/update (including client-side defaults),
 * `fromDriver` parses on select.
 */
export function json<T>() {
  return customType<{ data: T; driverData: string }>({
    dataType() {
      return "text";
    },
    toDriver(value: T): string {
      return JSON.stringify(value);
    },
    fromDriver(value: string): T {
      if (value == null) return null as unknown as T;
      return JSON.parse(value) as T;
    },
  });
}
