"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";

export function LoginSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />}
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}
