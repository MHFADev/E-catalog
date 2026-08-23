import Link from "next/link";
import Icon from "@/components/common/Icon";
import { getSellerAccount } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import SellerLocationForm from "@/components/seller/SellerLocationForm";

export default async function SellerDashboardPage() {
  const account = await getSellerAccount();
  const seller = account?.sellers;
  const supabase = await createClient();
  const [
    { count },
    { data: sellerRow },
    { count: pendingWhatsAppOrders },
    { count: pendingTransferOrders },
  ] = await Promise.all([
    seller
      ? supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("seller_id", seller.id)
      : Promise.resolve({ count: 0 }),
    seller
      ? supabase.from("sellers").select("*").eq("id", seller.id).maybeSingle()
      : Promise.resolve({ data: null }),
    seller
      ? supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("seller_id", seller.id)
          .eq("status", "menunggu_konfirmasi")
      : Promise.resolve({ count: 0 }),
    seller
      ? supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("seller_id", seller.id)
          .eq("status", "menunggu_verifikasi")
      : Promise.resolve({ count: 0 }),
  ]);

  const full = sellerRow || seller;
  const hasLoc = Boolean(full?.location_lat != null && full?.location_lng != null);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-7 border border-cream-warm">
        <div className="flex items-start gap-3">
          {full?.logo && (
            <img
              src={full.logo}
              alt={full?.name || "Logo toko"}
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border border-cream-warm shrink-0"
            />
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <div className="text-sm font-semibold text-noir">{full?.name}</div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <Icon name="badgeCheck" size={10} /> Akun penjual aktif
              </span>
            </div>
            {full?.description && (
              <p className="text-xs md:text-sm text-cool-gray leading-relaxed mb-2">
                {full.description}
              </p>
            )}
            <div className="text-xs md:text-sm text-warm-gray">
              {full?.whatsapp && <>WhatsApp: {full.whatsapp}</>}
              {full?.address && <> • {full.address}</>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-cream-warm">
          <div className="text-3xl font-bold text-forest">{count ?? 0}</div>
          <div className="text-xs text-warm-gray mt-1">Produk Anda di katalog</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-sky-200">
          <Link href="/seller/orders?status=menunggu_konfirmasi" className="flex items-center justify-between gap-3 group">
            <div>
              <div className={`text-3xl font-bold ${pendingWhatsAppOrders > 0 ? "text-sky-800" : "text-noir"}`}>
                {pendingWhatsAppOrders ?? 0}
              </div>
              <div className="text-xs text-warm-gray mt-1">Pesanan WA perlu respons</div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest group-hover:underline">
              Kelola <Icon name="arrowRight" size={12} />
            </span>
          </Link>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-amber-200">
          <Link href="/seller/orders?status=menunggu_verifikasi" className="flex items-center justify-between gap-3 group">
            <div>
              <div className={`text-3xl font-bold ${pendingTransferOrders > 0 ? "text-amber-700" : "text-noir"}`}>
                {pendingTransferOrders ?? 0}
              </div>
              <div className="text-xs text-warm-gray mt-1">Transfer perlu diverifikasi</div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest group-hover:underline">
              Kelola <Icon name="arrowRight" size={12} />
            </span>
          </Link>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-cream-warm sm:col-span-3 flex flex-col gap-2">
          <Link
            href="/seller/products"
            className="btn-primary text-sm py-2.5 text-center"
          >
            Kelola Produk Saya
          </Link>
          <Link
            href="/seller/payment"
            className="btn-secondary text-sm py-2.5 text-center"
          >
            Atur Metode Pembayaran
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-7 border border-cream-warm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="flex items-center gap-2 text-sm md:text-base font-bold text-noir">
            <Icon name="mapPin" size={16} className="text-laut" /> Lokasi Toko
          </h3>
          <Link
            href="/#peta"
            className="inline-flex items-center gap-1 text-[11px] md:text-xs font-semibold text-laut hover:underline"
          >
            <Icon name="navigation" size={14} /> Lihat Peta Katalog
          </Link>
        </div>
        {hasLoc ? (
          <p className="text-xs md:text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-3">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="badgeCheck" size={14} className="shrink-0" />
              Lokasi terdaftar — pin toko Anda tampil di peta untuk semua
              pengunjung. Ubah bila perlu.
            </span>
          </p>
        ) : (
          <p className="text-xs md:text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            Lokasi belum diisi. Tekan “Ambil Lokasi Saya” agar pin toko Anda
            muncul di peta katalog.
          </p>
        )}
        <SellerLocationForm seller={full} />
      </div>

      <div className="bg-forest/5 border border-forest/20 rounded-2xl p-4 md:p-5">
        <p className="text-xs md:text-sm text-noir-soft leading-relaxed">
          <strong>Akun toko ini bersifat individual:</strong> Anda hanya dapat mengelola produk, metode pembayaran, dan pesanan milik toko sendiri. Tanggapi pesanan WhatsApp terlebih dahulu, lalu verifikasi transfer secara mandiri sebelum memproses pesanan.
        </p>
      </div>
    </div>
  );
}

