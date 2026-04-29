"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/db/schema";

interface JobFiltersProps {
  roles: Category[];
  experiences: Category[];
  selectedRole?: string;
  selectedExperience?: string;
}

export function JobFilters({ roles, experiences, selectedRole, selectedExperience }: JobFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex gap-3 flex-wrap">
      <Select value={selectedRole ?? "all"} onValueChange={(v) => updateFilter("role", v ?? "all")}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          {roles.map((r) => (
            <SelectItem key={r.id} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedExperience ?? "all"} onValueChange={(v) => updateFilter("experience", v ?? "all")}>
        <SelectTrigger className="w-52">
          <SelectValue placeholder="All Experience Levels" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Experience Levels</SelectItem>
          {experiences.map((e) => (
            <SelectItem key={e.id} value={e.value}>
              {e.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
