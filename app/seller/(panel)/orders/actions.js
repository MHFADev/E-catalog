"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSellerAccount } from "@/lib/auth";

async function requireSellerOrder(orderId) {
  const account = await getSellerAccount();
  if (!account || account.status !== "approved" || !account.seller_id) {
    throw new Error("Akun penjual belum disetujui");
  }
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, seller_id, status")
    .eq("id", orderId)
    .eq("seller_id", account.seller_id)
    .maybeSingle();
  if (!order) throw new Error("Pesanan tidak ditemukan");
  return { order, supabase };
}

async function setOrderStatus(orderId, status, extra = {}) {
  const { order, supabase } = await requireSellerOrder(orderId);
  const payload = { status, ...extra, updated_at: new Date().toISOString() };
  const { error } = await supabase.from("orders").update(payload).eq("id", order.id);
  if (error) throw new Error(error.message);
  revalidatePath("/seller/orders");
}

// Penjual sudah cek mutasi rekening/e-wallet, dana masuk -> proses pesanan.
export async function processOrder(formData) {
  const id = formData.get("id");
  if (!id) throw new Error("Parameter salah");
  await setOrderStatus(id, "diproses");
}

// Penjual TOLAK pesanan karena dana belum masuk / bukti tidak valid.
export async function rejectOrder(formData) {
  const id = formData.get("id");
  const reason = (formData.get("reason") || "").toString().trim();
  if (!id) throw new Error("Parameter salah");
  await setOrderStatus(id, "ditolak", { rejection_reason: reason || null });
}

// Pesanan selesai dikirim / diserahkan.
export async function completeOrder(formData) {
  const id = formData.get("id");
  if (!id) throw new Error("Parameter salah");
  await setOrderStatus(id, "selesai");
}
