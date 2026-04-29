import { db } from "@/db";
import { categories } from "@/db/schema";
import { CATEGORY_TYPES } from "@/lib/constants";
import { JobForm } from "@/components/admin/job-form";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "New Job — Admin" };

export default async function NewJobPage() {
  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(categories.label);
  const roles = allCategories.filter((c) => c.type === CATEGORY_TYPES.ROLE);
  const experiences = allCategories.filter(
    (c) => c.type === CATEGORY_TYPES.EXPERIENCE,
  );

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
        <h1 className="text-2xl font-bold">Create New Job</h1>
      </div>
      <JobForm roles={roles} experiences={experiences} />
    </div>
  );
}
