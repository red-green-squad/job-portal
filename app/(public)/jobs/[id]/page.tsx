import React, { Suspense } from "react";
import { getJobById } from "@/lib/queries";
import { notFound } from "next/navigation";
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
import { cacheLife, cacheTag } from "next/cache";

export const unstable_instant = { prefetch: "static" };

interface PageProps {
  params: Promise<{ id: string }>;
}

// Separate cached helper so generateMetadata doesn't re-run getJobById uncached
async function getJobMeta(id: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("jobs");
  cacheTag(`job-${id}`);
  const job = await getJobById(id);
  if (!job) return null;
  return { title: job.title, company: job.company };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const meta = await getJobMeta(id);
  if (!meta) return { title: "Job Not Found" };
  return { title: `${meta.title} at ${meta.company} — Job Board` };
}

function parseDescription(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let sectionKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (!trimmed) continue;

    // Key-value pair: "Label : Value" or "Label: Value" with content after the colon
    const kvMatch = trimmed.match(/^([A-Za-z][^:]{1,40}?)\s*:\s*(.+)$/);
    if (kvMatch) {
      elements.push(
        <p key={sectionKey++} className="text-sm">
          <span className="font-bold underline">{kvMatch[1].trim()} : {kvMatch[2].trim()}</span>
        </p>
      );
      continue;
    }

    // Section heading: line that ends with ":" and has no content after it
    if (/^[A-Z][^:]{0,60}:\s*$/.test(trimmed)) {
      elements.push(
        <h3
          key={sectionKey++}
          className="text-base font-semibold text-foreground mt-6 first:mt-0 pb-1 border-b"
        >
          {trimmed.replace(/:$/, "")}
        </h3>
      );
      continue;
    }

    if (/^[-*•]|^\d+\./.test(trimmed)) {
      const bulletLines: string[] = [];
      let j = i;
      while (j < lines.length) {
        const t = lines[j].trim();
        if (!t) { j++; break; }
        if (/^[-*•]|^\d+\./.test(t) || bulletLines.length === 0) {
          bulletLines.push(t.replace(/^[-*•]\s*/, "").replace(/^\d+\.\s*/, ""));
          j++;
        } else {
          break;
        }
      }
      elements.push(
        <ul key={sectionKey++} className="space-y-1.5 pl-1">
          {bulletLines.map((item, idx) => (
            <li key={idx} className="flex gap-2 text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
      i = j - 1;
      continue;
    }

    elements.push(
      <p key={sectionKey++} className="text-muted-foreground">
        {trimmed}
      </p>
    );
  }

  return elements;
}

// Cached per job ID — output included in the static shell for instant client navigation
async function JobDetailContent({ id }: { id: string }) {
  "use cache";
  cacheLife("hours");
  cacheTag("jobs");
  cacheTag(`job-${id}`);

  const job = await getJobById(id);
  if (!job) notFound();

  const { daysLeft } = job;

  return (
    <>
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
                  <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" />
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

      <div className="space-y-4 text-sm leading-relaxed">
        {parseDescription(job.description)}
      </div>

      {job.applyUrl && (
        <>
          <Separator />
          <div className="flex justify-center">
            <Button
              size="lg"
              render={
                <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" />
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
    </>
  );
}

function JobDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="rounded-xl border bg-muted/40 px-5 py-5 flex gap-4">
        <div className="w-1/3 rounded-lg bg-muted h-32 shrink-0" />
        <div className="w-2/3 space-y-3">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-6 bg-muted rounded w-2/3" />
          <div className="flex gap-2">
            <div className="h-5 bg-muted rounded w-16" />
            <div className="h-5 bg-muted rounded w-20" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-4/6" />
      </div>
    </div>
  );
}

export default function JobDetailPage({ params }: PageProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to listings
      </Link>

      <Suspense fallback={<JobDetailSkeleton />}>
        {params.then(({ id }) => <JobDetailContent id={id} />)}
      </Suspense>
    </div>
  );
}
