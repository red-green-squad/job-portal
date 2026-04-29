import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = req.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isLoginPage && !req.auth) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && req.auth) {
    const dashboardUrl = new URL("/admin", req.nextUrl.origin);
    return NextResponse.redirect(dashboardUrl);
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
