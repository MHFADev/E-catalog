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

  // Nama komentar TIDAK diambil dari form — diambil dari profil akun
  // yang sedang login (username). Field "name"/"username" manual tidak ada lagi.
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const { productId, rating, comment } = body || {};
  if (!productId || !comment?.trim()) {
    return NextResponse.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
  }
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    return NextResponse.json({ error: "Rating harus antara 1 dan 5" }, { status: 400 });
  }
  if (comment.trim().length > 1000) {
    return NextResponse.json({ error: "Teks terlalu panjang" }, { status: 400 });
  }

  const name = profile?.username || user.email?.split("@")[0] || "Pengguna";

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    name,
    user_id: user.id,
    rating: r,
    comment: comment.trim(),
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, name }, { status: 201 });
}
