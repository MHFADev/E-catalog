"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateWhatsAppLink } from "@/lib/generateWhatsAppLink";

function makeOrderNumber() {
  return `ORD-${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

function normalizePhone(value) {
  return (value || "").toString().replace(/\D/g, "");
}

function formatAmount(value) {
  if (value == null) return "Harga dikonfirmasi oleh penjual";
  return `IDR ${Number(value).toLocaleString("id-ID")}`;
}

async function getAvailableProductAndSeller(supabase, productId, { requireWhatsApp = false } = {}) {
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, seller_id, price, show_price, is_available")
    .eq("id", productId)
    .maybeSingle();

  if (productError || !product) throw new Error("Produk tidak ditemukan");
  if (product.is_available === false) {
    throw new Error("Produk sedang tidak tersedia");
  }

  const { data: seller, error: sellerError } = await supabase
    .from("sellers")
    .select("id, name, whatsapp, is_blocked")
    .eq("id", product.seller_id)
    .maybeSingle();

  if (sellerError || !seller || seller.is_blocked === true) {
    throw new Error("Toko ini belum dapat menerima pesanan");
  }
  if (requireWhatsApp && !seller.whatsapp) {
    throw new Error("Nomor WhatsApp toko belum tersedia");
  }

  return { product, seller };
}

// ============================================================
// Checkout transfer manual. Pembeli memilih metode pembayaran dan mengunggah
// bukti transfer; pesanan masuk sebagai "menunggu_verifikasi".
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

  const { product } = await getAvailableProductAndSeller(supabase, productId);

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

  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_number: makeOrderNumber(),
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
      order_channel: "manual_payment",
      status: "menunggu_verifikasi",
    })
    .select("order_number")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/product/${productId}`);
  revalidatePath("/seller/orders");
  revalidatePath("/admin/buyers");
  return { ok: true, orderNumber: data.order_number };
}

// ============================================================
// Pesan melalui WhatsApp. Data kontak dan detail pesanan disimpan lebih dulu
// pada akun pembeli yang sedang login, lalu browser menerima tautan WhatsApp
// yang sudah memuat nomor referensi pesanan.
// ============================================================
export async function createWhatsAppOrder(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Masuk terlebih dahulu untuk membuat pesanan WhatsApp");

  const productId = (formData.get("productId") || "").toString().trim();
  const quantity = parseInt(formData.get("quantity") || "1", 10);
  const buyerName = (formData.get("buyerName") || "").toString().trim();
  const buyerPhone = normalizePhone(formData.get("buyerPhone"));
  const buyerCountry = (formData.get("buyerCountry") || "").toString().trim();
  const buyerAddress = (formData.get("buyerAddress") || "").toString().trim();
  const notes = (formData.get("notes") || "").toString().trim();

  if (!productId) throw new Error("Produk tidak valid");
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
    throw new Error("Jumlah pesanan harus antara 1 hingga 999");
  }
  if (buyerName.length < 2 || buyerName.length > 120) {
    throw new Error("Masukkan nama pemesan yang valid");
  }
  if (buyerPhone.length < 8 || buyerPhone.length > 18) {
    throw new Error("Masukkan nomor WhatsApp dengan kode negara, misalnya +62");
  }
  if (buyerCountry.length < 2 || buyerCountry.length > 80) {
    throw new Error("Pilih negara tujuan pengiriman");
  }
  if (buyerAddress.length < 8 || buyerAddress.length > 600) {
    throw new Error("Masukkan alamat pengiriman yang cukup lengkap");
  }
  if (notes.length > 800) {
    throw new Error("Catatan maksimal 800 karakter");
  }

  const { product, seller } = await getAvailableProductAndSeller(supabase, productId, {
    requireWhatsApp: true,
  });
  const showPrice = product.show_price !== false && product.price != null;
  const unitPrice = showPrice ? Number(product.price) : null;
  const total = unitPrice != null ? Math.round(unitPrice * quantity * 100) / 100 : null;

  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_number: makeOrderNumber(),
      product_id: product.id,
      seller_id: seller.id,
      buyer_user_id: user.id,
      buyer_name: buyerName,
      buyer_phone: buyerPhone,
      buyer_country: buyerCountry,
      buyer_address: buyerAddress,
      quantity,
      unit_price: unitPrice,
      total,
      notes: notes || null,
      order_channel: "whatsapp",
      status: "menunggu_konfirmasi",
      whatsapp_chat_opened_at: new Date().toISOString(),
    })
    .select("order_number")
    .single();

  if (error) throw new Error(error.message);

  const message = [
    `Halo ${seller.name}, saya ${buyerName} ingin memesan melalui E-CATALOG.`,
    "",
    `Nomor pesanan: ${data.order_number}`,
    `Produk: ${product.name}`,
    `Jumlah: ${quantity}`,
    `Total: ${formatAmount(total)}`,
    `Tujuan: ${buyerCountry}`,
    `Alamat: ${buyerAddress}`,
    notes ? `Catatan: ${notes}` : null,
    "",
    "Mohon konfirmasi ketersediaan, ongkir, dan langkah pembayaran berikutnya. Terima kasih.",
  ]
    .filter(Boolean)
    .join("\n");

  revalidatePath(`/product/${productId}`);
  revalidatePath("/seller/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/buyers");

  return {
    ok: true,
    orderNumber: data.order_number,
    whatsappUrl: generateWhatsAppLink(seller.whatsapp, message),
  };
}
