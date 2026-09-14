import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Silakan login untuk mengirim rating dan komentar." },
      { status: 401 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Data ulasan tidak valid." }, { status: 400 });
  }

  const productId = String(body?.productId || "").trim();
  const comment = String(body?.comment || "").trim();
  const rating = Number(body?.rating);

  if (!productId || !comment) {
    return NextResponse.json({ error: "Rating dan komentar wajib diisi." }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating harus bernilai antara 1 sampai 5." }, { status: 400 });
  }
  if (comment.length < 3 || comment.length > 1000) {
    return NextResponse.json({ error: "Komentar harus berisi 3–1000 karakter." }, { status: 400 });
  }

  // Identitas diambil dari profil akun aktif; pengunjung tidak dapat memilih
  // nama atau user_id lain untuk rating yang mereka kirim.
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const name = profile?.username || user.email?.split("@")[0] || "Pengguna";
  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      product_id: productId,
      name,
      user_id: user.id,
      rating,
      comment,
      // Rating baru dipublikasikan langsung agar terlihat lintas browser.
      status: "approved",
    })
    .select("id, product_id, name, rating, comment, date, user_id")
    .single();

  if (error || !review) {
    return NextResponse.json(
      { error: error?.message || "Rating belum dapat disimpan." },
      { status: 500 },
    );
  }

  revalidateTag("catalog");
  revalidatePath(`/product/${productId}`);

  return NextResponse.json(
    {
      ok: true,
      review: {
        id: review.id,
        productId: review.product_id,
        name: review.name,
        username: profile?.username || null,
        avatarUrl: profile?.avatar_url || null,
        rating: review.rating,
        comment: review.comment,
        date: review.date,
        userId: review.user_id,
      },
    },
    { status: 201 },
  );
}

export async function DELETE(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Silakan login untuk menghapus rating." },
      { status: 401 },
    );
  }

  let reviewId;
  try {
    const body = await request.json();
    reviewId = body?.id || body?.reviewId;
  } catch {
    const url = new URL(request.url);
    reviewId = url.searchParams.get("id");
  }

  if (!reviewId) {
    return NextResponse.json(
      { error: "ID rating tidak ditemukan." },
      { status: 400 },
    );
  }

  // Verifikasi rating ada dan milik pengguna yang sedang login
  const { data: review, error: fetchError } = await supabase
    .from("reviews")
    .select("id, product_id, user_id")
    .eq("id", reviewId)
    .maybeSingle();

  if (fetchError || !review) {
    return NextResponse.json(
      { error: "Rating tidak ditemukan." },
      { status: 404 },
    );
  }

  if (review.user_id !== user.id) {
    return NextResponse.json(
      { error: "Anda hanya dapat menghapus rating milik sendiri." },
      { status: 403 },
    );
  }

  let deleteError = null;
  const { error: userDeleteError } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (userDeleteError) {
    try {
      const adminSupabase = await createAdminClient();
      const { error: adminError } = await adminSupabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);
      deleteError = adminError;
    } catch {
      deleteError = userDeleteError;
    }
  }

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError?.message || "Gagal menghapus rating." },
      { status: 500 },
    );
  }

  revalidateTag("catalog");
  if (review.product_id) {
    revalidatePath(`/product/${review.product_id}`);
  }
  revalidatePath("/");
  revalidatePath("/catalog");

  return NextResponse.json({
    ok: true,
    message: "Rating berhasil dihapus.",
    reviewId,
    productId: review.product_id,
  });
}

