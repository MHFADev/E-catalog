"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/useUser";
import { useProfile } from "@/lib/useProfile";

// ============================================================
// Gate intercept route: jika user login tapi is_onboarded == false
// di tabel profiles, arahkan ke /onboarding. Skip untuk halaman
// onboarding/login/auth/admin/seller-login agar tidak infinite loop.
// ============================================================

export default function OnboardingGate() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { profile, loading: profileLoading } = useProfile();
  const redirected = useRef(false);

  const exempt =
    pathname === "/onboarding" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/seller/login") ||
    pathname.startsWith("/api/");

  useEffect(() => {
    if (userLoading || profileLoading || exempt) return;
    if (
      user &&
      profile &&
      profile.is_onboarded === false &&
      !redirected.current
    ) {
      redirected.current = true;
      router.replace("/onboarding");
    }
  }, [user, profile, userLoading, profileLoading, exempt, router]);

  return null;
}
