"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobSchema, type JobFormData } from "@/lib/validations";
import { JOB_TYPES } from "@/lib/constants";
import type { Category, Job } from "@/db/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "@/lib/date-utils";
import { createJob, updateJob } from "@/actions/jobs";
import { toast } from "sonner";
import { useTransition } from "react";
import { Loader2Icon } from "lucide-react";

interface JobFormProps {
  roles: Category[];
  experiences: Category[];
  defaultValues?: Partial<Job>;
  jobId?: string;
  onCancel?: () => void;
}

export function JobForm({ roles, experiences, defaultValues, jobId, onCancel }: JobFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<JobFormData>({
    // Cast needed due to Zod v4 / @hookform/resolvers type inference gap on z.date()
    resolver: zodResolver(jobSchema) as Resolver<JobFormData>,
    defaultValues: {
      title: defaultValues?.title ?? "",
      company: defaultValues?.company ?? "",
      description: defaultValues?.description ?? "",
      roleId: defaultValues?.roleId ?? undefined,
      experienceId: defaultValues?.experienceId ?? undefined,
      location: defaultValues?.location ?? "",
      salary: defaultValues?.salary ?? "",
      type: (defaultValues?.type as JobFormData["type"]) ?? "full-time",
      applyUrl: defaultValues?.applyUrl ?? "",
      lastDate: defaultValues?.lastDate ? new Date(defaultValues.lastDate) : undefined,
      isActive: defaultValues?.isActive ?? true,
    },
  });

  function onSubmit(data: JobFormData) {
    startTransition(async () => {
      const result = jobId ? await updateJob(jobId, data) : await createJob(data);
      if (result && "error" in result) {
        toast.error(result.error);
      }
      // On success, server action redirects to /admin
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Job Title *</FormLabel>
                <FormControl>
                  <Input placeholder="Senior Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Company *</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Corp" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the role, responsibilities, requirements..."
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="roleId"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || null)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No role</SelectItem>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="experienceId"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Experience Level</FormLabel>
                <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || null)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Any level</SelectItem>
                    {experiences.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Job Type *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {JOB_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="location"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="San Francisco, CA or Remote" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="salary"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Salary Range</FormLabel>
                <FormControl>
                  <Input placeholder="$120k–$160k" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="applyUrl"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Application URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/apply" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastDate"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Application Deadline</FormLabel>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          className="flex-1 justify-start font-normal text-left"
                        />
                      }
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {field.value ? format(field.value as Date) : "Pick a date"}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value as Date | undefined}
                        onSelect={field.onChange}
                        disabled={(date: Date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {field.value && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => field.onChange(undefined)}
                      className="shrink-0"
                      aria-label="Clear deadline"
                    >
                      ×
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={() => onCancel ? onCancel() : history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />}
            {isPending ? "Saving..." : jobId ? "Save changes" : "Create job"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
