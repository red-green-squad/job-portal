"use client";

import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { JobForm } from "./job-form";
import type { Category, Job } from "@/db/schema";

interface JobSheetProps {
  mode: "new" | "edit";
  job?: Job | null;
  roles: Category[];
  experiences: Category[];
}

export function JobSheet({ mode, job, roles, experiences }: JobSheetProps) {
  const router = useRouter();

  function handleClose() {
    router.push("/admin");
  }

  return (
    <DialogPrimitive.Root open={true} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup className="fixed top-0 right-0 z-50 h-full w-[70%] bg-card border-l border-border shadow-2xl flex flex-col duration-300 data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right outline-none">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
            <div>
              <DialogPrimitive.Title className="text-xl font-semibold">
                {mode === "new" ? "Create New Job" : "Edit Job"}
              </DialogPrimitive.Title>
              {mode === "edit" && job && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {job.title} at {job.company}
                </p>
              )}
            </div>
            <DialogPrimitive.Close
              aria-label="Close"
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <XIcon className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <JobForm
              roles={roles}
              experiences={experiences}
              defaultValues={job ?? undefined}
              jobId={job?.id}
              onCancel={handleClose}
            />
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
