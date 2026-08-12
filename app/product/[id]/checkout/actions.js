"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// Membuat pesanan baru (checkout). 100% manual, tanpa payment gateway:
// pembeli memilih metode pembayaran milik UMKM, upload bukti transfer
// (disimpan di bucket privat order-receipts), lalu pesanan masuk dengan
// status 'menunggu_verifikasi' untuk diverifikasi penjual.
// ============================================================

export async function createOrder(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Anda harus login untuk checkout");

  const productId = (formData.get("productId") || "").toString().trim();
  const paymentMethodId = (formData.get("paymentMethodId") || "").toString().trim();
  const quantity = parseInt(formData.get("quantity") || "1", 10);
  const buyerName = (formData.get("buyerName") || "").toString().trim();
  const buyerPhone = (formData.get("buyerPhone") || "").toString().trim();
  const buyerAddress = (formData.get("buyerAddress") || "").toString().trim();
  const notes = (formData.get("notes") || "").toString().trim();
  const receiptPath = (formData.get("receiptPath") || "").toString().trim();

  if (!productId || !paymentMethodId) throw new Error("Data pesanan tidak lengkap");
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
    throw new Error("Jumlah tidak valid");
  }
  if (!buyerName) throw new Error("Nama pemesan wajib diisi");
  if (!receiptPath) throw new Error("Wajib upload bukti transfer / pembayaran");

  const { data: product, error: pErr } = await supabase
    .from("products")
    .select("id, seller_id, price, show_price, is_available")
    .eq("id", productId)
    .maybeSingle();
  if (pErr || !product) throw new Error("Produk tidak ditemukan");
  if (product.is_available === false) {
    throw new Error("Produk sedang tidak tersedia");
  }

  const { data: pay, error: payErr } = await supabase
    .from("payment_methods")
    .select("id, seller_id, is_active")
    .eq("id", paymentMethodId)
    .maybeSingle();
  if (payErr || !pay || pay.is_active === false || pay.seller_id !== product.seller_id) {
    throw new Error("Metode pembayaran tidak valid");
  }

  const showPrice = product.show_price !== false && product.price != null;
  const unitPrice = showPrice ? Number(product.price) : null;
  const total = unitPrice != null ? Math.round(unitPrice * quantity * 100) / 100 : null;

  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      product_id: productId,
      seller_id: product.seller_id,
      payment_method_id: paymentMethodId,
      buyer_user_id: user.id,
      buyer_name: buyerName,
      buyer_phone: buyerPhone || null,
      buyer_address: buyerAddress || null,
      quantity,
      unit_price: unitPrice,
      total,
      notes: notes || null,
      receipt_path: receiptPath,
      status: "menunggu_verifikasi",
    })
    .select("order_number")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/product/${productId}`);
  return { ok: true, orderNumber: data.order_number };
}
