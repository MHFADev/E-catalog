import { NextResponse } from "next/server";
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

function text(value, maxLength) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

// Endpoint JSON pendamping untuk integrasi internal. Alur publik memakai
// server action di /gabung dan kedua jalur menerapkan validasi yang sepadan.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON tidak valid." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
  }

  const businessName = text(body?.businessName, 100);
  const ownerName = text(body?.ownerName, 100);
  const businessType = text(body?.businessType, 80);
  const categoryProduct = text(body?.categoryProduct || body?.productType, 160);
  const whatsapp = text(body?.whatsapp, 30).replace(/\D/g, "");
  const address = text(body?.address, 240);
  const description = text(body?.description, 600);

  if (businessName.length < 2 || ownerName.length < 2 || address.length < 8 || whatsapp.length < 9) {
    return NextResponse.json({ error: "Lengkapi identitas usaha, pengelola, WhatsApp, dan lokasi usaha." }, { status: 400 });
  }
  if (!BUSINESS_TYPES.has(businessType) || categoryProduct.length < 3 || description.length < 20) {
    return NextResponse.json({ error: "Lengkapi bidang usaha, produk utama, dan deskripsi usaha." }, { status: 400 });
  }
  if (body?.consent !== "accepted") {
    return NextResponse.json({ error: "Persetujuan pengajuan wajib diberikan." }, { status: 400 });
  }

  const { error } = await supabase.from("join_requests").insert({
    user_id: user.id,
    email: user.email,
    business_name: businessName,
    owner_name: ownerName,
    business_type: businessType,
    category_product: categoryProduct,
    whatsapp,
    address,
    service_area: text(body?.serviceArea, 160) || null,
    description,
    business_hours: text(body?.businessHours, 100) || null,
    instagram_handle: text(body?.instagramHandle, 160) || null,
    product_image: text(body?.productImage, 1000) || null,
    notes: text(body?.notes, 500) || null,
    consented_at: new Date().toISOString(),
    status: "pending",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
