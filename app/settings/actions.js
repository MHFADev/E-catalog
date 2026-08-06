"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSellerAccount } from "@/lib/auth";

async function requireApprovedSeller() {
  const account = await getSellerAccount();
  if (!account || account.status !== "approved" || !account.seller_id) {
    throw new Error("Akun penjual belum disetujui");
  }
  return account;
}

export async function updateSellerStore(formData) {
  const account = await requireApprovedSeller();
  const name = (formData.get("name") || "").toString().trim();
  if (!name) throw new Error("Nama toko wajib diisi");

  const supabase = await createClient();
  const { error } = await supabase
    .from("sellers")
    .update({ name })
    .eq("id", account.seller_id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  revalidatePath("/seller");
  revalidatePath("/");
  revalidatePath("/catalog");
  return { ok: true };
}