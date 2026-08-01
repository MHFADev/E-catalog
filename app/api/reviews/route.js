import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Harus login untuk mengirim komentar" },
      { status: 401 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON tidak valid" }, { status: 400 });
  }

  const { productId, name, rating, comment } = body || {};
  if (!productId || !name?.trim() || !comment?.trim()) {
    return NextResponse.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
  }
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    return NextResponse.json({ error: "Rating harus antara 1 dan 5" }, { status: 400 });
  }
  if (name.trim().length > 60 || comment.trim().length > 1000) {
    return NextResponse.json({ error: "Teks terlalu panjang" }, { status: 400 });
  }

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    name: name.trim(),
    rating: r,
    comment: comment.trim(),
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
