import { db } from "@/db";
import { jobs, categories } from "@/db/schema";
import { and, eq, gte, ilike, isNull, or, sql, count } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { PAGE_SIZE, CATEGORY_TYPES } from "@/lib/constants";
import { JobCard } from "@/components/job-card";
import { SearchInput } from "@/components/search-input";
import { JobFilters } from "@/components/job-filters";
import { JobsPagination } from "@/components/jobs-pagination";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
    experience?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { search, role, experience, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10));
  const today = new Date();

  const roleAlias = alias(categories, "role");
  const expAlias = alias(categories, "experience");

  const whereConditions = [
    eq(jobs.isActive, true),
    or(isNull(jobs.lastDate), gte(jobs.lastDate, today))!,
  ];

  if (search) {
    whereConditions.push(
      or(
        ilike(jobs.title, `%${search}%`),
        ilike(jobs.company, `%${search}%`),
        ilike(jobs.description, `%${search}%`)
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

  const [{ total }] = await db
    .select({ total: count() })
    .from(jobs)
    .where(where);

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
    .orderBy(jobs.lastDate)
    .limit(PAGE_SIZE)
    .offset(offset);

  const allCategories = await db.select().from(categories).orderBy(categories.label);
  const roles = allCategories.filter((c) => c.type === CATEGORY_TYPES.ROLE);
  const experiences = allCategories.filter((c) => c.type === CATEGORY_TYPES.EXPERIENCE);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Find Your Next Job</h1>
        <p className="text-muted-foreground mt-1">{total} open position{total !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Suspense>
            <SearchInput defaultValue={search} />
          </Suspense>
        </div>
        <Suspense>
          <JobFilters
            roles={roles}
            experiences={experiences}
            selectedRole={role}
            selectedExperience={experience}
          />
        </Suspense>
      </div>

      {jobRows.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No jobs found matching your criteria.</p>
          <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {jobRows.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      <Suspense>
        <JobsPagination currentPage={currentPage} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}

export function generateMetadata() {
  return { title: "Job Board — Open Positions" };
}
