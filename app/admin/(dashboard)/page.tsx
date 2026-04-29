import { db } from "@/db";
import { jobs, categories } from "@/db/schema";
import { alias } from "drizzle-orm/pg-core";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/date-utils";
import { JobRowActions } from "@/components/admin/job-row-actions";
import { JobSheet } from "@/components/admin/job-sheet";
import { CATEGORY_TYPES } from "@/lib/constants";

export const metadata = { title: "Jobs — Admin" };

interface PageProps {
  searchParams: Promise<{ new?: string; edit?: string }>;
}

export default async function AdminDashboard({ searchParams }: PageProps) {
  const { new: isNew, edit: editId } = await searchParams;

  const roleAlias = alias(categories, "role");
  const expAlias = alias(categories, "experience");

  const allJobs = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      company: jobs.company,
      type: jobs.type,
      lastDate: jobs.lastDate,
      isActive: jobs.isActive,
      createdAt: jobs.createdAt,
      role: { label: roleAlias.label },
      experience: { label: expAlias.label },
    })
    .from(jobs)
    .leftJoin(roleAlias, eq(jobs.roleId, roleAlias.id))
    .leftJoin(expAlias, eq(jobs.experienceId, expAlias.id))
    .orderBy(desc(jobs.createdAt));

  const today = new Date();

  // Fetch sheet data only when needed
  const sheetOpen = isNew !== undefined || !!editId;
  let roles: (typeof categories.$inferSelect)[] = [];
  let experiences: (typeof categories.$inferSelect)[] = [];
  let editJob: (typeof jobs.$inferSelect) | null = null;

  if (sheetOpen) {
    const allCategories = await db.select().from(categories).orderBy(categories.label);
    roles = allCategories.filter((c) => c.type === CATEGORY_TYPES.ROLE);
    experiences = allCategories.filter((c) => c.type === CATEGORY_TYPES.EXPERIENCE);

    if (editId) {
      const [found] = await db.select().from(jobs).where(eq(jobs.id, editId)).limit(1);
      editJob = found ?? null;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Listings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{allJobs.length} total jobs</p>
        </div>
        <Button render={<Link href="/admin?new=1" />} nativeButton={false}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Job
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Role</TableHead>
              <TableHead className="hidden lg:table-cell">Type</TableHead>
              <TableHead className="hidden sm:table-cell">Deadline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-25">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allJobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No jobs yet. Create your first one.
                </TableCell>
              </TableRow>
            )}
            {allJobs.map((job) => {
              const expired = !!job.lastDate && new Date(job.lastDate) < today;
              return (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="font-medium">{job.title}</div>
                    <div className="text-xs text-muted-foreground">{job.company}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {job.role?.label ?? "—"}
                    {job.experience?.label && (
                      <span className="text-muted-foreground"> · {job.experience.label}</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm capitalize">{job.type}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">
                    <span className={expired ? "text-destructive" : ""}>
                      {job.lastDate ? formatDate(job.lastDate) : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={job.isActive && !expired ? "default" : "secondary"}>
                      {expired ? "Expired" : job.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <JobRowActions jobId={job.id} isActive={job.isActive} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {sheetOpen && (
        <JobSheet
          mode={editJob ? "edit" : "new"}
          job={editJob}
          roles={roles}
          experiences={experiences}
        />
      )}
    </div>
  );
}
