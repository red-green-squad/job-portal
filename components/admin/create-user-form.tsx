"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminUserSchema, type AdminUserFormData } from "@/lib/validations";
import { createAdminUser } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function CreateUserForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<AdminUserFormData>({
    resolver: zodResolver(adminUserSchema) as Resolver<AdminUserFormData>,
    defaultValues: { name: "", email: "", password: "" },
  });

  function onSubmit(data: AdminUserFormData) {
    startTransition(async () => {
      const result = await createAdminUser(data);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Admin user created");
        form.reset();
        router.refresh();
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <h3 className="font-medium">Add New Admin</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="jane@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Min 8 characters" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isPending} size="sm">
          {isPending ? "Creating..." : "Create admin"}
        </Button>
      </form>
    </Form>
  );
}
