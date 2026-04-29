export const PAGE_SIZE = 10;

export const JOB_TYPES = [
  { label: "Full-time", value: "full-time" },
  { label: "Part-time", value: "part-time" },
  { label: "Contract", value: "contract" },
  { label: "Remote", value: "remote" },
] as const;

export const CATEGORY_TYPES = {
  ROLE: "role",
  EXPERIENCE: "experience",
} as const;
