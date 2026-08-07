"use server";
import { revalidatePath, revalidateTag } from "next/cache";
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
  revalidateTag("catalog");
  return { ok: true };
}

// ===== Foto profil akun (profiles.avatar_url) — semua user login =====
export async function updateAccountAvatar(url) {
  const value = (url || "").toString().trim();
  if (!value) throw new Error("URL foto tidak boleh kosong");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Harus login dulu");

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: value })
    .eq("id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  return { ok: true };
}

// ===== Foto toko (sellers.logo = raw URL GitHub) =====
export async function updateStorePhoto(url) {
  const account = await requireApprovedSeller();
  const value = (url || "").toString().trim();
  if (!value) throw new Error("URL foto tidak boleh kosong");

  const supabase = await createClient();
  const { error } = await supabase
    .from("sellers")
    .update({ logo: value })
    .eq("id", account.seller_id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  revalidatePath("/seller");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidateTag("catalog");
  return { ok: true };
}

// ===== Metode Pembayaran (seller) =====
export async function updatePaymentMethods(formData) {
  const account = await requireApprovedSeller();

  const enabledPaymentMethods = formData.getAll("enabledPaymentMethods").filter(Boolean);
  const bankName = (formData.get("bankName") || "").toString().trim();
  const bankAccountNumber = (formData.get("bankAccountNumber") || "").toString().trim();
  const bankAccountName = (formData.get("bankAccountName") || "").toString().trim();
  const ewalletType = (formData.get("ewalletType") || "").toString().trim();
  const ewalletNumber = (formData.get("ewalletNumber") || "").toString().trim();
  const qrisImage = (formData.get("qrisImage") || "").toString().trim();

  const payload = {
    bank_name: enabledPaymentMethods.includes("bank") && bankName ? bankName : null,
    bank_account_number: enabledPaymentMethods.includes("bank") && bankAccountNumber ? bankAccountNumber : null,
    bank_account_name: enabledPaymentMethods.includes("bank") && bankAccountName ? bankAccountName : null,
    ewallet_type: enabledPaymentMethods.includes("ewallet") && ewalletType ? ewalletType : null,
    ewallet_number: enabledPaymentMethods.includes("ewallet") && ewalletNumber ? ewalletNumber : null,
    qris_image_url: enabledPaymentMethods.includes("qris") && qrisImage ? qrisImage : null,
    enabled_payment_methods: enabledPaymentMethods.length ? enabledPaymentMethods : [],
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("sellers")
    .update(payload)
    .eq("id", account.seller_id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  revalidatePath("/seller");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidateTag("catalog");
  return { ok: true };
}