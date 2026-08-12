import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwarded = request.headers.get("x-forwarded-host");
      const base = forwarded ? `https://${forwarded}` : origin;

      // Intercept: user yang belum menyelesaikan onboarding diarahkan
      // ke /onboarding (is_onboarded = false di tabel profiles).
      let target = next;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_onboarded")
          .eq("id", user.id)
          .maybeSingle();
        if (profile && profile.is_onboarded === false && next !== "/onboarding") {
          target = "/onboarding";
        }
      }

      return NextResponse.redirect(`${base}${target}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
