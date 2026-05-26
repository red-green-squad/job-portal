import { db } from "@/db";
import { jobs, categories } from "@/db/schema";
import { and, desc, eq, gte, like, isNull, or, sql, count } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { cacheLife, cacheTag } from "next/cache";
import { PAGE_SIZE, CATEGORY_TYPES } from "./constants";

export async function getCategories() {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");
  console.log("[cache miss] getCategories");
  return db.select().from(categories).orderBy(categories.label);
}

export async function getJobsPage(filters: {
  search?: string;
  role?: string;
  experience?: string;
  page?: string;
  today: string; // YYYY-MM-DD — provided by the caller so new Date() stays outside 'use cache'
}) {
  "use cache";
  cacheLife("hours");
  cacheTag("jobs");
  console.log(`[cache miss] getJobsPage -- ${JSON.stringify(filters)}`);

  const { search, role, experience, page } = filters;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10));
  const today = new Date(filters.today);

  const roleAlias = alias(categories, "role");
  const expAlias = alias(categories, "experience");

  const whereConditions = [
    eq(jobs.isActive, true),
    or(isNull(jobs.lastDate), gte(jobs.lastDate, today))!,
  ];

  if (search) {
    whereConditions.push(
      or(
        like(jobs.title, `%${search}%`),
        like(jobs.company, `%${search}%`),
        like(jobs.description, `%${search}%`)
      )!
    );
  }

  if (role) {
    const [roleRow] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.type, CATEGORY_TYPES.ROLE), eq(categories.value, role)))
      .limit(1);
    if (roleRow) whereConditions.push(eq(jobs.roleId, roleRow.id));
    else whereConditions.push(sql`false`);
  }

  if (experience) {
    const [expRow] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.type, CATEGORY_TYPES.EXPERIENCE), eq(categories.value, experience)))
      .limit(1);
    if (expRow) whereConditions.push(eq(jobs.experienceId, expRow.id));
    else whereConditions.push(sql`false`);
  }

  const where = and(...whereConditions);

  const [{ total }] = await db.select({ total: count() }).from(jobs).where(where);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const jobRows = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      company: jobs.company,
      description: jobs.description,
      roleId: jobs.roleId,
      experienceId: jobs.experienceId,
      location: jobs.location,
      salary: jobs.salary,
      type: jobs.type,
      applyUrl: jobs.applyUrl,
      lastDate: jobs.lastDate,
      companyLogo: jobs.companyLogo,
      isActive: jobs.isActive,
      createdAt: jobs.createdAt,
      updatedAt: jobs.updatedAt,
      role: {
        id: roleAlias.id,
        type: roleAlias.type,
        label: roleAlias.label,
        value: roleAlias.value,
        createdAt: roleAlias.createdAt,
      },
      experience: {
        id: expAlias.id,
        type: expAlias.type,
        label: expAlias.label,
        value: expAlias.value,
        createdAt: expAlias.createdAt,
      },
    })
    .from(jobs)
    .leftJoin(roleAlias, eq(jobs.roleId, roleAlias.id))
    .leftJoin(expAlias, eq(jobs.experienceId, expAlias.id))
    .where(where)
    .orderBy(desc(jobs.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  return { jobRows, total, totalPages, currentPage };
}

export async function getJobById(id: string) {
  "use cache";
  cacheLife("max"); // near-indefinite; invalidated explicitly via updateTag on mutations
  cacheTag("jobs");
  cacheTag(`job-${id}`);
  console.log(`[cache miss] getJobById -- ${id}`);

  const roleAlias = alias(categories, "role");
  const expAlias = alias(categories, "experience");

  const [job] = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      company: jobs.company,
      description: jobs.description,
      companyLogo: jobs.companyLogo,
      location: jobs.location,
      salary: jobs.salary,
      type: jobs.type,
      applyUrl: jobs.applyUrl,
      lastDate: jobs.lastDate,
      isActive: jobs.isActive,
      createdAt: jobs.createdAt,
      updatedAt: jobs.updatedAt,
      roleId: jobs.roleId,
      experienceId: jobs.experienceId,
      role: {
        id: roleAlias.id,
        type: roleAlias.type,
        label: roleAlias.label,
        value: roleAlias.value,
        createdAt: roleAlias.createdAt,
      },
      experience: {
        id: expAlias.id,
        type: expAlias.type,
        label: expAlias.label,
        value: expAlias.value,
        createdAt: expAlias.createdAt,
      },
    })
    .from(jobs)
    .leftJoin(roleAlias, eq(jobs.roleId, roleAlias.id))
    .leftJoin(expAlias, eq(jobs.experienceId, expAlias.id))
    .where(eq(jobs.id, id))
    .limit(1);

  if (!job || !job.isActive) return null;
  return job; // date-sensitive checks (expiry, daysLeft) stay outside 'use cache'
}
