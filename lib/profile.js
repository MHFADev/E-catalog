import { createClient } from "@/lib/supabase/server";

// ============================================================
// Helper server: profil pengguna yang sedang login.
// (tabel profiles — TIDAK membuat tabel/flow auth baru, ini
//  integrasi dengan Supabase Auth + skema yang sudah ada)
// ============================================================

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return data || null;
}
