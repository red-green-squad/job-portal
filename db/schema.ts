import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  unique,
  index,
} from "drizzle-orm/pg-core";

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: text("type").notNull(), // 'role' | 'experience'
    label: text("label").notNull(),
    value: text("value").notNull(), // slug
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    unique("categories_type_value_unique").on(t.type, t.value),
    index("categories_type_idx").on(t.type),
  ],
);

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    company: text("company").notNull(),
    description: text("description").notNull(),
    roleId: uuid("role_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    experienceId: uuid("experience_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    location: text("location"),
    salary: text("salary"),
    type: text("type").notNull(), // 'full-time' | 'part-time' | 'contract' | 'remote'
    applyUrl: text("apply_url"),
    lastDate: timestamp("last_date", { mode: "date" }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("jobs_role_id_idx").on(t.roleId),
    index("jobs_experience_id_idx").on(t.experienceId),
    index("jobs_last_date_idx").on(t.lastDate),
    index("jobs_is_active_idx").on(t.isActive),
  ],
);

export type AdminUser = typeof adminUsers.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type JobWithRelations = Job & {
  role: Category | null;
  experience: Category | null;
};
