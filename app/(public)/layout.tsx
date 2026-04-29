import Link from "next/link";
import { BriefcaseIcon } from "lucide-react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <BriefcaseIcon className="h-5 w-5 text-primary" />
            Job Board
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Job Board. All rights reserved.
      </footer>
    </div>
  );
}
