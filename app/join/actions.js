"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const BUSINESS_TYPES = new Set([
  "Kuliner & Minuman",
  "Fashion & Aksesori",
  "Kriya & Produk Kreatif",
  "Kecantikan & Kesehatan",
  "Sembako & Kebutuhan Rumah",
  "Jasa",
  "Lainnya",
]);

function readText(formData, key, maxLength = 1000) {
  return (formData.get(key) || "")
    .toString()
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

// Pengajuan UMKM selalu dikaitkan dengan akun login. Form hanya meminta
// informasi usaha yang relevan untuk peninjauan admin, bukan data sensitif.
export async function submitJoinRequest(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Silakan masuk terlebih dahulu untuk mengirim pengajuan.");

  const businessName = readText(formData, "businessName", 100);
  const ownerName = readText(formData, "ownerName", 100);
  const businessType = readText(formData, "businessType", 80);
  const categoryProduct = readText(formData, "categoryProduct", 160);
  const whatsapp = readText(formData, "whatsapp", 30).replace(/\D/g, "");
  const address = readText(formData, "address", 240);
  const serviceArea = readText(formData, "serviceArea", 160);
  const description = readText(formData, "description", 600);
  const businessHours = readText(formData, "businessHours", 100);
  const instagramHandle = readText(formData, "instagramHandle", 160);
  const notes = readText(formData, "notes", 500);
  const productImage = readText(formData, "productImage", 1000);

  if (businessName.length < 2 || ownerName.length < 2 || !whatsapp || address.length < 8) {
    throw new Error("Lengkapi nama usaha, nama pengelola, WhatsApp, dan lokasi usaha.");
  }
  if (!BUSINESS_TYPES.has(businessType)) {
    throw new Error("Pilih bidang usaha dari daftar yang tersedia.");
  }
  if (categoryProduct.length < 3) {
    throw new Error("Tuliskan produk atau layanan utama usaha Anda.");
  }
  if (whatsapp.length < 9 || whatsapp.length > 16) {
    throw new Error("Nomor WhatsApp belum valid.");
  }
  if (description.length < 20) {
    throw new Error("Deskripsi usaha perlu berisi minimal 20 karakter.");
  }
  if (formData.get("consent") !== "accepted") {
    throw new Error("Setujui pernyataan kebenaran data sebelum mengirim pengajuan.");
  }

  const { error } = await supabase.from("join_requests").insert({
    user_id: user.id,
    email: user.email,
    business_name: businessName,
    owner_name: ownerName,
    business_type: businessType,
    whatsapp,
    category_product: categoryProduct,
    address,
    service_area: serviceArea || null,
    description,
    business_hours: businessHours || null,
    instagram_handle: instagramHandle || null,
    notes: notes || null,
    product_image: productImage || null,
    consented_at: new Date().toISOString(),
    status: "pending",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/gabung");
  revalidatePath("/admin/join");
  return { ok: true };
}
