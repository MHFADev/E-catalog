import Link from "next/link";
import Icon from "@/components/common/Icon";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const STATUS_META = {
  menunggu_konfirmasi: {
    label: "Menunggu konfirmasi WA",
    className: "bg-sky-50 text-sky-800 border-sky-200",
  },
  menunggu_verifikasi: {
    label: "Menunggu verifikasi",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  diproses: {
    label: "Diproses",
    className: "bg-violet-50 text-violet-800 border-violet-200",
  },
  selesai: {
    label: "Selesai",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  ditolak: {
    label: "Ditolak",
    className: "bg-red-50 text-red-800 border-red-200",
  },
  dibatalkan: {
    label: "Dibatalkan",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCurrency(value) {
  if (value == null) return "Konfirmasi harga";
  return `Rp${Number(value).toLocaleString("id-ID")}`;
}

function buildHref({ channel = "", status = "", page = 1 }) {
  const query = new URLSearchParams();
  if (channel) query.set("channel", channel);
  if (status) query.set("status", status);
  if (page > 1) query.set("page", String(page));
  const suffix = query.toString();
  return `/admin/buyers${suffix ? `?${suffix}` : ""}`;
}

export default async function AdminBuyersPage({ searchParams }) {
  const params = await searchParams;
  const channel = params.channel === "whatsapp" || params.channel === "manual_payment" ? params.channel : "";
  const status = typeof params.status === "string" ? params.status : "";
  const requestedPage = Number.parseInt(params.page || "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createAdminClient();
  let ordersQuery = supabase
    .from("orders")
    .select(
      "id, order_number, buyer_name, buyer_phone, buyer_country, buyer_address, quantity, total, status, order_channel, created_at, products(name), sellers(name)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (channel) ordersQuery = ordersQuery.eq("order_channel", channel);
  if (status && STATUS_META[status]) ordersQuery = ordersQuery.eq("status", status);

  const [ordersResult, buyersResult, pendingWhatsAppResult] = await Promise.all([
    ordersQuery,
    supabase
      .from("admin_buyer_summary")
      .select("buyer_user_id, buyer_name, buyer_phone, buyer_country, order_count, pending_order_count, last_order_at", { count: "exact" })
      .order("last_order_at", { ascending: false })
      .limit(8),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("order_channel", "whatsapp")
      .eq("status", "menunggu_konfirmasi"),
  ]);

  if (ordersResult.error || buyersResult.error || pendingWhatsAppResult.error) {
    throw new Error("Data pembeli belum dapat dimuat. Coba muat ulang halaman ini.");
  }

  const orders = ordersResult.data || [];
  const buyers = buyersResult.data || [];
  const totalOrders = ordersResult.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalOrders / PAGE_SIZE));
  const totalBuyers = buyersResult.count || 0;
  const pendingWhatsApp = pendingWhatsAppResult.count || 0;

  const filters = [
    { label: "Semua pembelian", channel: "", status: "" },
    { label: "Via WhatsApp", channel: "whatsapp", status: "" },
    { label: "Transfer manual", channel: "manual_payment", status: "" },
    { label: "Butuh respons", channel: "whatsapp", status: "menunggu_konfirmasi" },
  ];

  return (
    <div className="pb-8">
      <header className="flex flex-wrap items-start justify-between gap-4 mb-5 md:mb-7">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-forest mb-1">Transaksi</p>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-noir">Pembeli & Pembelian</h2>
          <p className="text-xs md:text-sm text-warm-gray mt-1 max-w-2xl leading-relaxed">
            Pantau kontak pembeli dan perkembangan pesanan. Data ini hanya tersedia untuk admin dan dipakai untuk membantu penyelesaian transaksi.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-forest/10 border border-forest/15 px-3 py-1.5 text-xs font-bold text-forest">
          <Icon name="lock" size={12} /> Data privat
        </span>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5 md:mb-6">
        <div className="surface-raised rounded-2xl p-4">
          <div className="text-2xl font-bold text-noir">{totalBuyers}</div>
          <div className="text-xs text-warm-gray mt-1">Pembeli tercatat</div>
        </div>
        <div className="surface-raised rounded-2xl p-4">
          <div className="text-2xl font-bold text-noir">{totalOrders}</div>
          <div className="text-xs text-warm-gray mt-1">Pembelian pada filter ini</div>
        </div>
        <div className="surface-raised rounded-2xl p-4 col-span-2 lg:col-span-1 border border-sky-200">
          <div className="text-2xl font-bold text-sky-800">{pendingWhatsApp}</div>
          <div className="text-xs text-sky-800/80 mt-1">Pesanan WhatsApp menunggu respons</div>
        </div>
      </section>

      <section className="surface-raised rounded-2xl md:rounded-3xl p-4 md:p-5 mb-5 md:mb-6">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="font-bold text-sm md:text-base text-noir">Pembeli terbaru</h3>
          <span className="text-[11px] text-warm-gray">Berdasarkan pesanan terakhir</span>
        </div>
        {!buyers.length ? (
          <p className="text-sm text-warm-gray py-3">Belum ada pembeli yang tercatat.</p>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {buyers.map((buyer) => (
              <div key={buyer.buyer_user_id} className="rounded-xl bg-cream-pure border border-cream-warm p-3 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-noir truncate">{buyer.buyer_name}</p>
                    <p className="text-xs text-warm-gray truncate">+{buyer.buyer_phone || "—"}</p>
                  </div>
                  <Icon name="user" size={15} className="text-forest shrink-0" />
                </div>
                <p className="text-[11px] text-warm-gray mt-2 truncate">{buyer.buyer_country || "Negara belum diisi"}</p>
                <div className="flex justify-between gap-2 mt-2 pt-2 border-t border-cream-warm text-[11px]">
                  <span className="font-semibold text-noir">{buyer.order_count} pesanan</span>
                  {Number(buyer.pending_order_count) > 0 && (
                    <span className="font-bold text-sky-800">{buyer.pending_order_count} perlu respons</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="surface-raised rounded-2xl md:rounded-3xl p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-sm md:text-base text-noir">Daftar pembelian</h3>
            <p className="text-xs text-warm-gray mt-0.5">{totalOrders} transaksi pada hasil saat ini</p>
          </div>
          <div className="flex gap-2 overflow-x-auto max-w-full pb-1">
            {filters.map((filter) => {
              const active = channel === filter.channel && status === filter.status;
              return (
                <Link
                  key={filter.label}
                  href={buildHref(filter)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-forest text-white border-forest"
                      : "bg-white border-cream-warm text-noir-soft hover:border-forest/40 hover:text-forest"
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>
        </div>

        {!orders.length ? (
          <div className="rounded-2xl bg-cream-pure border border-cream-warm px-4 py-10 text-center">
            <Icon name="shoppingBagFilled" size={22} className="text-warm-gray mx-auto mb-2" />
            <p className="font-semibold text-sm text-noir">Belum ada pembelian pada filter ini</p>
            <p className="text-xs text-warm-gray mt-1">Coba pilih filter lain atau kembali saat ada pesanan baru.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const statusMeta = STATUS_META[order.status] || { label: order.status, className: "bg-gray-100 text-gray-700 border-gray-200" };
              const isWhatsApp = order.order_channel === "whatsapp";
              return (
                <article key={order.id} className="rounded-2xl border border-cream-warm bg-white p-4 md:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-xs font-bold text-forest">{order.order_number}</p>
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusMeta.className}`}>
                          {statusMeta.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${isWhatsApp ? "bg-emerald-50 text-emerald-700" : "bg-violet-50 text-violet-700"}`}>
                          <Icon name={isWhatsApp ? "whatsapp" : "money"} size={10} />
                          {isWhatsApp ? "WhatsApp" : "Transfer"}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm md:text-base text-noir mt-1.5">
                        {order.products?.name || "Produk"} <span className="font-normal text-warm-gray">× {order.quantity}</span>
                      </h4>
                      <p className="text-xs text-warm-gray mt-0.5">Toko: {order.sellers?.name || "—"} · {formatDate(order.created_at)}</p>
                    </div>
                    <div className="text-left md:text-right shrink-0">
                      <div className="text-sm font-bold text-noir">{formatCurrency(order.total)}</div>
                      <div className="text-[11px] text-warm-gray">Nilai pesanan</div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-cream-warm text-xs">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-warm-gray">Pembeli</p>
                      <p className="font-semibold text-noir mt-0.5">{order.buyer_name}</p>
                      <p className="text-warm-gray mt-0.5">+{order.buyer_phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-warm-gray">Tujuan</p>
                      <p className="font-semibold text-noir mt-0.5">{order.buyer_country || "—"}</p>
                      <p className="text-warm-gray mt-0.5 line-clamp-2">{order.buyer_address || "Alamat belum diisi"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-warm-gray">Catatan pembeli</p>
                      <p className="text-warm-gray mt-0.5 line-clamp-3">{order.notes || "Tidak ada catatan"}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-cream-warm" aria-label="Paginasi pembelian">
            {page > 1 ? (
              <Link href={buildHref({ channel, status, page: page - 1 })} className="btn-secondary text-xs py-2 px-3">
                <Icon name="arrowLeft" size={12} /> Sebelumnya
              </Link>
            ) : <span />}
            <span className="text-xs text-warm-gray">Halaman {page} dari {totalPages}</span>
            {page < totalPages ? (
              <Link href={buildHref({ channel, status, page: page + 1 })} className="btn-secondary text-xs py-2 px-3">
                Berikutnya <Icon name="arrowRight" size={12} />
              </Link>
            ) : <span />}
          </nav>
        )}
      </section>
    </div>
  );
}
