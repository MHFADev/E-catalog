import { createClient } from "@/lib/supabase/server";

export async function isAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  return data?.role === "admin";
}

export async function getSellerAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("seller_accounts")
    .select("*, sellers(name)")
    .eq("user_id", user.id)
    .maybeSingle();
  return data || null;
}

export async function isSellerOrAdmin() {
  if (await isAdmin()) return true;
  const acc = await getSellerAccount();
  return Boolean(acc?.status === "approved" && acc.seller_id);
}
