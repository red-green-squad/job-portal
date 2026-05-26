import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";

export const adminUsers = sqliteTable("admin_users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    type: text("type").notNull(), // 'role' | 'experience'
    label: text("label").notNull(),
    value: text("value").notNull(), // slug
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("categories_type_value_unique").on(t.type, t.value),
    index("categories_type_idx").on(t.type),
  ],
);

export const jobs = sqliteTable(
  "jobs",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    company: text("company").notNull(),
    description: text("description").notNull(),
    roleId: text("role_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    experienceId: text("experience_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    location: text("location"),
    salary: text("salary"),
    type: text("type").notNull(), // 'full-time' | 'part-time' | 'contract' | 'remote'
    applyUrl: text("apply_url"),
    lastDate: integer("last_date", { mode: "timestamp" }),
    companyLogo: text("company_logo"),
    isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
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
