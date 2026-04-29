"use server";

import { db } from "@/db";
import { categories, jobs } from "@/db/schema";
import { categorySchema } from "@/lib/validations";
import { eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResult = { error: string } | { success: true };

export async function createCategory(data: unknown): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.insert(categories).values(parsed.data);
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(id: string, data: unknown): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.update(categories).set(parsed.data).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const [referenced] = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(or(eq(jobs.roleId, id), eq(jobs.experienceId, id)))
    .limit(1);

  if (referenced) {
    return { error: "Cannot delete: this category is used by one or more job listings. Remove those jobs or reassign them first." };
  }

  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
  return { success: true };
}
