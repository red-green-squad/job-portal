"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryFormData } from "@/lib/validations";
import type { Category } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusIcon, Trash2Icon, Loader2Icon } from "lucide-react";
import { createCategory, deleteCategory } from "@/actions/categories";
import { toast } from "sonner";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

interface CategorySectionProps {
  title: string;
  type: "role" | "experience";
  items: Category[];
}

export function CategorySection({ title, type, items }: CategorySectionProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { type, label: "", value: "" },
  });

  function onLabelChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue("value", slugify(e.target.value));
  }

  function onSubmit(data: CategoryFormData) {
    startTransition(async () => {
      const result = await createCategory(data);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(`${title} created`);
        reset({ type, label: "", value: "" });
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteCategory(deleteId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Category deleted");
        router.refresh();
      }
      setDeleteId(null);
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-6 text-muted-foreground text-sm"
                >
                  No {title.toLowerCase()} yet.
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.label}</TableCell>
                <TableCell className="text-sm text-muted-foreground font-mono">
                  {item.value}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3 items-end">
        <input type="hidden" {...register("type")} />
        <div className="space-y-1.5">
          <Label htmlFor={`${type}-label`}>Label</Label>
          <Input
            id={`${type}-label`}
            placeholder={type === "role" ? "Frontend Engineer" : "Senior Level"}
            {...register("label", {
              onChange: onLabelChange,
            })}
            className="w-48"
          />
          {errors.label && (
            <p className="text-xs text-destructive">{errors.label.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${type}-value`}>Slug</Label>
          <Input
            id={`${type}-value`}
            placeholder="frontend-engineer"
            {...register("value")}
            className="w-48"
          />
          {errors.value && (
            <p className="text-xs text-destructive">{errors.value.message}</p>
          )}
        </div>
        <Button type="submit" disabled={isPending} size="sm">
          {isPending ? <Loader2Icon className="h-4 w-4 mr-1 animate-spin" /> : <PlusIcon className="h-4 w-4 mr-1" />}
          {isPending ? "Adding..." : "Add"}
        </Button>
      </form>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will fail if any jobs are currently using this category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
