"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/useUser";

// ============================================================
// Hook client: profil user login (username, avatar, phone, dsb).
// Dipakai oleh OnboardingGate, ReviewSection, dan komponen lain.
// ============================================================

export function useProfile() {
  const { user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (userLoading) return;

    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase
      .from("profiles")
      .select("id, username, avatar_url, phone_number, date_of_birth, is_onboarded, username_updated_at")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setProfile(data || null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user, userLoading]);

  return { profile, loading };
}
