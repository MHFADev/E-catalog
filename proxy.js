import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request) {
  const { supabaseResponse, user } = await updateSession(request);

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute && !user && pathname !== "/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
