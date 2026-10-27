import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Self-referencing category tree.
 * NOTE: the parent FK is not declared via `.references()` because
 * drizzle 0.44 + TS strict mode cannot infer self-referencing
 * table initializers (TS7022 circularity). The constraint is
 * added manually in the generated migration SQL instead:
 *   foreign key ("parent_id") references "categories"("id") on delete set null
 */
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  parentId: integer("parent_id"),
});
