import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { uploadPublicImage } from "@/lib/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BASE64_LENGTH = 1_100_000;

function jsonError(message, status) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function safeMessage(error) {
  const message = error instanceof Error ? error.message : "";
  if (/GitHub|gambar|Upload|Data gambar|koneksi/i.test(message)) return message;
  return "Upload gambar belum berhasil. Silakan coba lagi.";
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Data upload tidak dapat dibaca. Pilih gambar lalu coba lagi.", 400);
  }

  const base64 = typeof payload?.base64 === "string" ? payload.base64 : "";
  const name = typeof payload?.name === "string" ? payload.name : "image";
  if (!base64 || base64.length > MAX_REQUEST_BASE64_LENGTH) {
    return jsonError("Gambar terlalu besar untuk dikirim. Pilih gambar yang lebih kecil lalu coba lagi.", 413);
  }

  try {
    const [supabase, adminUser] = await Promise.all([createClient(), isAdmin()]);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!adminUser && userError) {
      return jsonError("Sesi Anda tidak dapat diverifikasi. Silakan masuk kembali.", 401);
    }
    if (!adminUser && !user) {
      return jsonError("Anda harus masuk sebelum mengunggah gambar.", 401);
    }
  } catch {
    return jsonError("Layanan upload belum siap. Silakan coba lagi beberapa saat lagi.", 503);
  }

  try {
    const result = await uploadPublicImage({ base64, name });
    return NextResponse.json(
      { ok: true, url: result.url, path: result.path },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return jsonError(safeMessage(error), 422);
  }
}
