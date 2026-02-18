import {
  pgSchema,
  uuid,
  varchar,
  timestamp,
  numeric,
  index,
} from "drizzle-orm/pg-core";

export const starterSchema = pgSchema("starter");

// =============================================================================
// Users Table
// =============================================================================

export const users = starterSchema.table("users", {
  firebase_uid: varchar("firebase_uid", { length: 128 }).primaryKey(),
  email: varchar("email", { length: 255 }),
  display_name: varchar("display_name", { length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// =============================================================================
// Histories Table
// =============================================================================

export const histories = starterSchema.table(
  "histories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: varchar("user_id", { length: 128 })
      .notNull()
      .references(() => users.firebase_uid, { onDelete: "cascade" }),
    datetime: timestamp("datetime").notNull(),
    value: numeric("value", { precision: 12, scale: 2 }).notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userIdx: index("starter_histories_user_idx").on(table.user_id),
  })
);
