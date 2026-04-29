import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPinIcon, CalendarIcon, BriefcaseIcon } from "lucide-react";
import type { JobWithRelations } from "@/db/schema";
import { formatDistanceToNow } from "@/lib/date-utils";

export function JobCard({ job }: { job: JobWithRelations }) {
  const daysLeft = job.lastDate
    ? Math.ceil((new Date(job.lastDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">{job.title}</CardTitle>
            {daysLeft !== null && (
              <Badge variant={daysLeft <= 3 ? "destructive" : "secondary"} className="shrink-0 text-xs">
                {daysLeft <= 0 ? "Closing today" : `${daysLeft}d left`}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-medium">{job.company}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {job.role && <Badge variant="outline">{job.role.label}</Badge>}
            {job.experience && <Badge variant="outline">{job.experience.label}</Badge>}
            <Badge variant="outline" className="capitalize">{job.type}</Badge>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPinIcon className="h-3 w-3" />
                {job.location}
              </span>
            )}
            {job.salary && (
              <span className="flex items-center gap-1">
                <BriefcaseIcon className="h-3 w-3" />
                {job.salary}
              </span>
            )}
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              Posted {formatDistanceToNow(job.createdAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
