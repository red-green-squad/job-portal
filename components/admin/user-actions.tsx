"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { deactivateAdminUser, reactivateAdminUser } from "@/actions/users";
import { toast } from "sonner";

export function UserActions({ userId, isActive }: { userId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handle() {
    startTransition(async () => {
      const result = isActive
        ? await deactivateAdminUser(userId)
        : await reactivateAdminUser(userId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(isActive ? "User deactivated" : "User reactivated");
        router.refresh();
      }
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handle} disabled={isPending}>
      {isPending && <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />}
      {isPending ? "Saving..." : isActive ? "Deactivate" : "Reactivate"}
    </Button>
  );
}
