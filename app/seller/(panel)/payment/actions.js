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

function defaultLabel(methodType, provider) {
  if (methodType === "bank") return provider ? `Bank ${provider.toUpperCase()}` : "Transfer Bank";
  if (methodType === "ewallet") return provider ? provider.toUpperCase() : "E-Wallet";
  return "QRIS";
}

// Tambah metode pembayaran baru untuk toko UMKM ini.
export async function savePaymentMethod(formData) {
  const account = await requireApprovedSeller();
  const methodType = (formData.get("methodType") || "").toString().trim();
  const provider = (formData.get("provider") || "").toString().trim();
  const label = (formData.get("label") || "").toString().trim();
  const accountNumber = (formData.get("accountNumber") || "").toString().trim();
  const accountName = (formData.get("accountName") || "").toString().trim();
  const qrisImageUrl = (formData.get("qrisImageUrl") || "").toString().trim();

  if (!["bank", "ewallet", "qris"].includes(methodType)) {
    throw new Error("Tipe metode pembayaran tidak valid");
  }
  if (methodType === "qris") {
    if (!qrisImageUrl) throw new Error("Upload gambar QRIS terlebih dahulu");
  } else if (!accountNumber) {
    throw new Error("Nomor rekening / ID wajib diisi");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("payment_methods").insert({
    seller_id: account.seller_id,
    method_type: methodType,
    provider: provider || null,
    label: label || defaultLabel(methodType, provider),
    account_number: accountNumber || null,
    account_name: accountName || null,
    qris_image_url: qrisImageUrl || null,
    is_active: true,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/seller/payment");
  revalidateTag("catalog");
}

// Aktif / nonaktifkan metode pembayaran.
export async function togglePaymentMethod(formData) {
  const account = await requireApprovedSeller();
  const id = (formData.get("id") || "").toString().trim();
  const active = formData.get("active") === "true";
  if (!id) throw new Error("Parameter salah");

  const supabase = await createClient();
  const { error } = await supabase
    .from("payment_methods")
    .update({ is_active: active })
    .eq("id", id)
    .eq("seller_id", account.seller_id);
  if (error) throw new Error(error.message);

  revalidatePath("/seller/payment");
  revalidateTag("catalog");
}

// Hapus metode pembayaran.
export async function deletePaymentMethod(formData) {
  const account = await requireApprovedSeller();
  const id = (formData.get("id") || "").toString().trim();
  if (!id) throw new Error("Parameter salah");

  const supabase = await createClient();
  const { error } = await supabase
    .from("payment_methods")
    .delete()
    .eq("id", id)
    .eq("seller_id", account.seller_id);
  if (error) throw new Error(error.message);

  revalidatePath("/seller/payment");
  revalidateTag("catalog");
}
