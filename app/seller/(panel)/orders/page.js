import Link from "next/link";
import Icon from "@/components/common/Icon";
import { getSellerAccount } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import OrderCard from "@/components/orders/OrderCard";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "", label: "Semua" },
  { key: "menunggu_konfirmasi", label: "Perlu Konfirmasi" },
  { key: "menunggu_verifikasi", label: "Menunggu Verifikasi" },
  { key: "diproses", label: "Diproses" },
  { key: "selesai", label: "Selesai" },
  { key: "ditolak", label: "Ditolak" },
];

export default async function SellerOrdersPage({ searchParams }) {
  const { status = "" } = await searchParams;
  const account = await getSellerAccount();
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, product_id, seller_id, buyer_name, buyer_phone, buyer_country, buyer_address, quantity, unit_price, total, notes, receipt_path, receipt_image_url, order_channel, status, rejection_reason, created_at, products(name, images), payment_methods(label, method_type, account_number, account_name)",
    )
    .eq("seller_id", account.seller_id)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const [{ data: orders }, { count: pendingCount }] = await Promise.all([
    query,
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", account.seller_id)
      .in("status", ["menunggu_konfirmasi", "menunggu_verifikasi"]),
  ]);

  const counts = orders?.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    },
    { menunggu_konfirmasi: 0, menunggu_verifikasi: 0 },
  );

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h2 className="text-sm md:text-base font-bold text-noir">
          Pesanan Masuk
        </h2>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold">
            <Icon name="bellFilled" size={12} />
            {pendingCount} perlu ditindaklanjuti
          </span>
        )}
      </div>

      {/* Tab filter status */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key ? `/seller/orders?status=${t.key}` : "/seller/orders"}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              status === t.key
                ? "bg-forest text-white border-forest"
                : "bg-white border-cream-warm text-noir-soft hover:border-forest/40"
            }`}
          >
            {t.label}
            {t.key && (
              <span className="ml-1 opacity-70">({counts?.[t.key] || 0})</span>
            )}
          </Link>
        ))}
      </div>

      {!orders?.length ? (
        <div className="bg-white rounded-2xl border border-cream-warm p-8 text-center text-sm text-warm-gray">
          Belum ada pesanan
          {status ? " dengan status ini" : ""}.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}

      <p className="text-[11px] text-warm-gray mt-4">
        Pesanan WhatsApp perlu dikonfirmasi lewat chat terlebih dahulu. Untuk transfer manual, cek mutasi rekening atau e-wallet sebelum memproses pesanan.
      </p>
    </div>
  );
}
