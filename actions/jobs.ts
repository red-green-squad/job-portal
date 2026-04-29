"use server";

import { db } from "@/db";
import { jobs } from "@/db/schema";
import { jobSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ActionResult = { error: string } | { success: true };

export async function createJob(data: unknown): Promise<ActionResult> {
  const parsed = jobSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { applyUrl, ...rest } = parsed.data;

  await db.insert(jobs).values({
    ...rest,
    roleId: rest.roleId ?? null,
    experienceId: rest.experienceId ?? null,
    applyUrl: applyUrl || null,
    lastDate: rest.lastDate ?? null,
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateJob(id: string, data: unknown): Promise<ActionResult> {
  const parsed = jobSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { applyUrl, ...rest } = parsed.data;

  await db
    .update(jobs)
    .set({
      ...rest,
      roleId: rest.roleId ?? null,
      experienceId: rest.experienceId ?? null,
      applyUrl: applyUrl || null,
      lastDate: rest.lastDate ?? null,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, id));

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function toggleJobActive(id: string): Promise<ActionResult> {
  const [job] = await db.select({ isActive: jobs.isActive }).from(jobs).where(eq(jobs.id, id)).limit(1);
  if (!job) return { error: "Job not found" };

  await db
    .update(jobs)
    .set({ isActive: !job.isActive, updatedAt: new Date() })
    .where(eq(jobs.id, id));

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteJob(id: string): Promise<ActionResult> {
  await db.delete(jobs).where(eq(jobs.id, id));
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}
