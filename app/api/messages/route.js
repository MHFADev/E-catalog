import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON tidak valid" }, { status: 400 });
  }

  const { name, email, subject, message } = body || {};
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });
  }
  if (
    name.trim().length > 80 ||
    email.trim().length > 120 ||
    (subject && subject.trim().length > 150) ||
    message.trim().length > 2000
  ) {
    return NextResponse.json({ error: "Teks terlalu panjang" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject?.trim() || "Pesan baru",
    message: message.trim(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
