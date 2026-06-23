import { CATEGORY_TYPES } from "@/lib/constants";
import { getJobsPage, getCategories } from "@/lib/queries";
import { JobCard } from "@/components/job-card";
import { SearchInput } from "@/components/search-input";
import { JobFilters } from "@/components/job-filters";
import { JobsPagination } from "@/components/jobs-pagination";
import { Suspense } from "react";
import { GoogleAdSenseBanner } from "@/components/google-ads";

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
  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD" — kept outside 'use cache'
  const [{ jobRows, total, totalPages, currentPage }, allCategories] =
    await Promise.all([
      getJobsPage({ search, role, experience, page, today }),
      getCategories(),
    ]);

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

      {/* Google AdSense Banner below search/filters */}
      <GoogleAdSenseBanner 
        slot="home_top_banner" 
        format="horizontal" 
        className="max-h-[120px]"
      />

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

      {/* Google AdSense Banner above pagination */}
      <GoogleAdSenseBanner
        slot="home_bottom_banner"
        format="horizontal"
        className="max-h-[120px]"
      />

      <Suspense>
        <JobsPagination currentPage={currentPage} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}

export function generateMetadata() {
  return { title: "Job Board — Open Positions" };
}
