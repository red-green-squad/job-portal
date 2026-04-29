import { db } from "@/db";
import { jobs, categories } from "@/db/schema";
import { alias } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
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
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  const [job] = await db
    .select({ title: jobs.title, company: jobs.company })
    .from(jobs)
    .where(eq(jobs.id, id))
    .limit(1);

  if (!job) return { title: "Job Not Found" };
  return { title: `${job.title} at ${job.company} — Job Board` };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const today = new Date();

  const roleAlias = alias(categories, "role");
  const expAlias = alias(categories, "experience");

  const [job] = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      company: jobs.company,
      description: jobs.description,
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

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="text-lg text-muted-foreground">{job.company}</p>
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
          <Badge variant="outline" className="capitalize">
            {job.type}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {job.location && (
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="h-4 w-4" />
              {job.location}
            </span>
          )}
          {job.salary && (
            <span className="flex items-center gap-1.5">
              <BriefcaseIcon className="h-4 w-4" />
              {job.salary}
            </span>
          )}
          {job.lastDate && (
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" />
              Apply by {formatDate(job.lastDate)}
              {daysLeft !== null && (
                <>
                  {" "}
                  ({daysLeft} day{daysLeft !== 1 ? "s" : ""} left)
                </>
              )}
            </span>
          )}
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
    </div>
  );
}
