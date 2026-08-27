"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_SELLER_COOKIE } from "@/lib/auth";

export async function selectActiveSellerStore(sellerId) {
  const targetSellerId = String(sellerId || "").trim();
  if (!targetSellerId) throw new Error("Toko belum dipilih.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Silakan masuk kembali.");

  const [{ data: access }, { data: primaryAccount }] = await Promise.all([
    supabase
      .from("seller_store_access")
      .select("seller_id")
      .eq("user_id", user.id)
      .eq("seller_id", targetSellerId)
      .eq("status", "approved")
      .maybeSingle(),
    supabase
      .from("seller_accounts")
      .select("seller_id, status")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const isPrimaryStore = primaryAccount?.status === "approved" && primaryAccount.seller_id === targetSellerId;
  if (!access && !isPrimaryStore) throw new Error("Anda tidak memiliki akses ke toko ini.");

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_SELLER_COOKIE, targetSellerId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidatePath("/seller", "layout");
}
