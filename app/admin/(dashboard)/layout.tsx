import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BriefcaseIcon, LayoutDashboardIcon, TagsIcon, UsersIcon, LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { NavLink } from "@/components/admin/nav-link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-sidebar flex flex-col shrink-0">
        <div className="h-14 flex items-center gap-2 px-4 border-b font-semibold">
          <BriefcaseIcon className="h-5 w-5 text-primary" />
          Admin Panel
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavLink href="/admin" icon={<LayoutDashboardIcon className="h-4 w-4" />}>
            Jobs
          </NavLink>
          <NavLink href="/admin/categories" icon={<TagsIcon className="h-4 w-4" />}>
            Categories
          </NavLink>
          <NavLink href="/admin/users" icon={<UsersIcon className="h-4 w-4" />}>
            Users
          </NavLink>
        </nav>

        <div className="p-3 border-t">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <Button variant="ghost" size="sm" type="submit" className="w-full justify-start gap-2 text-muted-foreground">
              <LogOutIcon className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center px-6 shrink-0">
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{session.user?.name}</span>
          </p>
          <div className="ml-auto">
            <Button variant="outline" size="sm" render={<Link href="/" target="_blank" />} nativeButton={false}>
              View site
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
