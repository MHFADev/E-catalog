import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

// ============================================================
// Metode pembayaran aktif milik sebuah UMKM (tabel payment_methods).
// RLS publik hanya menampilkan yang is_active = true, jadi aman dibaca
// tanpa login untuk halaman checkout / detail produk.
// ============================================================

export const getSellerPaymentMethods = unstable_cache(
  async function loadPaymentMethods(sellerId) {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("payment_methods")
        .select(
          "id, method_type, provider, label, account_number, account_name, qris_image_url, sort_order",
        )
        .eq("seller_id", sellerId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []).map((m) => ({
        id: m.id,
        methodType: m.method_type,
        provider: m.provider,
        label: m.label,
        accountNumber: m.account_number,
        accountName: m.account_name,
        qrisImageUrl: m.qris_image_url,
        sortOrder: m.sort_order || 0,
      }));
    } catch {
      return [];
    }
  },
  ["catalog-payment-methods"],
  { revalidate: 30, tags: ["catalog"] },
);
