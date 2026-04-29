import { signIn } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BriefcaseIcon } from "lucide-react";
import { LoginSubmitButton } from "@/components/admin/login-submit-button";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <BriefcaseIcon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Admin Sign In</CardTitle>
          <CardDescription>Sign in to manage job listings</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server";
              try {
                await signIn("credentials", {
                  email: formData.get("email"),
                  password: formData.get("password"),
                  redirectTo: "/admin",
                });
              } catch (err) {
                if (err instanceof AuthError) {
                  redirect(`/admin/login?error=Invalid+credentials`);
                }
                throw err;
              }
            }}
            className="space-y-4"
          >
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {decodeURIComponent(error)}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="admin@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required placeholder="••••••••" />
            </div>
            <LoginSubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export const metadata = { title: "Admin Sign In — Job Board" };
