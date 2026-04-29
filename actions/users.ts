"use server";

import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { adminUserSchema } from "@/lib/validations";
import { eq, count } from "drizzle-orm";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

type ActionResult = { error: string } | { success: true };

export async function createAdminUser(data: unknown): Promise<ActionResult> {
  const parsed = adminUserSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;
  const passwordHash = await hash(password, 12);

  await db.insert(adminUsers).values({ name, email, passwordHash });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function deactivateAdminUser(id: string): Promise<ActionResult> {
  const [{ activeCount }] = await db
    .select({ activeCount: count() })
    .from(adminUsers)
    .where(eq(adminUsers.isActive, true));

  if (activeCount <= 1) {
    return { error: "Cannot deactivate the last active admin user." };
  }

  await db.update(adminUsers).set({ isActive: false }).where(eq(adminUsers.id, id));
  revalidatePath("/admin/users");
  return { success: true };
}

export async function reactivateAdminUser(id: string): Promise<ActionResult> {
  await db.update(adminUsers).set({ isActive: true }).where(eq(adminUsers.id, id));
  revalidatePath("/admin/users");
  return { success: true };
}
