import { createClient } from "@/lib/supabase/server";

// ============================================================
// Menampilkan bukti transfer (bucket PRIVAT order-receipts) hanya
// kepada penjual yang memilik pesanan tsb atau pembelinya.
// Proteksi ganda: RLS tabel orders (seller/buyer) + RLS storage.
// ============================================================

export async function GET(request, { params }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, receipt_path")
    .eq("id", id)
    .maybeSingle();

  if (!order?.receipt_path) {
    return new Response("Not found", { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from("order-receipts")
    .download(order.receipt_path);
  if (error || !data) {
    return new Response("Not found", { status: 404 });
  }

  const bytes = await data.arrayBuffer();
  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": data.type || "image/webp",
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
