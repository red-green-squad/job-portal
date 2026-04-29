import { db } from "@/db";
import { jobs, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CATEGORY_TYPES } from "@/lib/constants";
import { JobForm } from "@/components/admin/job-form";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Edit Job — Admin" };

export default async function EditJobPage({ params }: PageProps) {
  const { id } = await params;

  const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  if (!job) notFound();

  const allCategories = await db.select().from(categories).orderBy(categories.label);
  const roles = allCategories.filter((c) => c.type === CATEGORY_TYPES.ROLE);
  const experiences = allCategories.filter((c) => c.type === CATEGORY_TYPES.EXPERIENCE);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to jobs
        </Link>
        <h1 className="text-2xl font-bold">Edit Job</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{job.title} at {job.company}</p>
      </div>
      <JobForm roles={roles} experiences={experiences} defaultValues={job} jobId={job.id} />
    </div>
  );
}
