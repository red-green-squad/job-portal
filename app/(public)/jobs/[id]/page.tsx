import { getJobById } from "@/lib/queries";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPinIcon,
  CalendarIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import { JobShareButtons } from "@/components/job-share-buttons";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) return { title: "Job Not Found" };
  return { title: `${job.title} at ${job.company} — Job Board` };
}

export default async function JobDetailPage({ params }: PageProps) {
  await connection();
  const { id } = await params;
  const today = new Date();

  const job = await getJobById(id);

  if (
    !job ||
    !job.isActive ||
    (job.lastDate !== null && new Date(job.lastDate) < today)
  ) {
    notFound();
  }

  const daysLeft = job.lastDate
    ? Math.ceil(
        // eslint-disable-next-line react-hooks/purity
        (new Date(job.lastDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      )
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to listings
      </Link>

      <div className="rounded-xl border bg-muted/40 px-5 py-5 flex items-stretch gap-4">
        {job.companyLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.companyLogo}
            alt={job.company}
            className="w-1/3 rounded-lg object-cover border bg-background shadow-sm shrink-0"
          />
        ) : (
          <div className="w-1/3 rounded-lg border bg-background shadow-sm flex items-center justify-center text-2xl font-bold text-muted-foreground shrink-0">
            {job.company.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="w-2/3 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{job.company}</p>
              <h1 className="text-xl font-bold leading-snug">{job.title}</h1>
            </div>
            {job.applyUrl && (
              <Button
                render={
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                nativeButton={false}
              >
                Apply Now
                <ExternalLinkIcon className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {job.role && <Badge>{job.role.label}</Badge>}
            {job.experience && (
              <Badge variant="secondary">{job.experience.label}</Badge>
            )}
            <Badge variant="outline" className="capitalize">{job.type}</Badge>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {job.location && (
              <span className="flex items-center gap-1.5">
                <MapPinIcon className="h-3.5 w-3.5" />
                {job.location}
              </span>
            )}
            {job.salary && (
              <span className="flex items-center gap-1.5">
                <BriefcaseIcon className="h-3.5 w-3.5" />
                {job.salary}
              </span>
            )}
            {job.lastDate && (
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                Apply by {formatDate(job.lastDate)}
                {daysLeft !== null && (
                  <> ({daysLeft} day{daysLeft !== 1 ? "s" : ""} left)</>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      <Separator />

      <div className="prose prose-sm max-w-none">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {job.description}
        </div>
      </div>

      {job.applyUrl && (
        <>
          <Separator />
          <div className="flex justify-center">
            <Button
              size="lg"
              render={
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              nativeButton={false}
            >
              Apply for this position
              <ExternalLinkIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      <Separator />
      <JobShareButtons title={job.title} company={job.company} />
    </div>
  );
}
