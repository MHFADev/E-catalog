"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Kirim permintaan gabung UMKM yang detail. Semua data masuk ke tabel
// join_requests (user_id + email dicatat agar admin bisa menautkan akun saat
// disetujui, sehingga data usaha langsung terimplementasi ke akun penjual).
export async function submitJoinRequest(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Harus login dulu");

  const get = (k) =>
    (formData.get(k) || "").toString().trim().replace(/\s+/g, " ").slice(0, 1000);

  const businessName = get("businessName");
  const whatsapp = get("whatsapp");
  if (!businessName || !whatsapp) {
    throw new Error("Nama usaha dan WhatsApp wajib diisi");
  }

  const { error } = await supabase.from("join_requests").insert({
    user_id: user.id,
    email: user.email,
    business_name: businessName,
    owner_name: get("ownerName") || null,
    whatsapp,
    category_product: get("categoryProduct") || null,
    address: get("address") || null,
    description: get("description") || null,
    notes: get("notes") || null,
    product_image: get("productImage") || null,
    status: "pending",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/gabung");
  return { ok: true };
}