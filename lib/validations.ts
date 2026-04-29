import { z } from "zod";

export const jobSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  roleId: z.string().uuid("Invalid role").nullable().optional(),
  experienceId: z.string().uuid("Invalid experience level").nullable().optional(),
  location: z.string().optional(),
  salary: z.string().optional(),
  type: z.enum(["full-time", "part-time", "contract", "remote"]),
  applyUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  lastDate: z.date().optional(),
  isActive: z.boolean().default(true),
});

export const categorySchema = z.object({
  type: z.enum(["role", "experience"]),
  label: z.string().min(2, "Label must be at least 2 characters"),
  value: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Value must be lowercase letters, numbers, and hyphens only"),
});

export const adminUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type JobFormData = z.infer<typeof jobSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type AdminUserFormData = z.infer<typeof adminUserSchema>;
