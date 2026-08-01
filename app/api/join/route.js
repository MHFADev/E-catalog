import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON tidak valid" }, { status: 400 });
  }

  const { businessName, ownerName, whatsapp, productType, notes } = body || {};
  if (!businessName?.trim() || !whatsapp?.trim()) {
    return NextResponse.json({ error: "Nama usaha dan WhatsApp wajib diisi" }, { status: 400 });
  }
  if (
    businessName.trim().length > 120 ||
    (ownerName && ownerName.trim().length > 120) ||
    whatsapp.trim().length > 30 ||
    (productType && productType.trim().length > 200) ||
    (notes && notes.trim().length > 1000)
  ) {
    return NextResponse.json({ error: "Teks terlalu panjang" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("join_requests").insert({
    business_name: businessName.trim(),
    owner_name: ownerName?.trim() || null,
    whatsapp: whatsapp.trim(),
    product_type: productType?.trim() || null,
    notes: notes?.trim() || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
