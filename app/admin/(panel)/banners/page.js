import Link from "next/link";
import Icon from "@/components/common/Icon";
import { createAdminClient } from "@/lib/supabase/admin";
import BannerForm from "./BannerForm";
import { toggleBanner, deleteBanner } from "../actions";

export default async function AdminBannersPage() {
  let banners = [];
  let loadError = null;
  const supabase = await createAdminClient();
  try {
    const { data } = await supabase
      .from("banners")
      .select("id, image_url, title, link, sort_order, active, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    banners = data || [];
  } catch (err) {
    loadError = err?.message || "Gagal membaca banner.";
  }

  return (
    <div>
      <h2 className="text-sm md:text-base font-bold text-noir mb-1">
        Banner Event / Promo ({banners?.length ?? 0})
      </h2>
      <p className="text-xs text-warm-gray mb-4 leading-relaxed">
        Banner tampil di beranda sebagai 2 gambar statis di sisi kanan video
        (atas-bawah). Banner <strong>urutan 0</strong> = kanan atas,{" "}
        <strong>urutan 1</strong> = kanan bawah. Cukup upload gambar — judul
        &amp; tautan opsional.
      </p>

      {loadError && (
        <div className="mb-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 leading-relaxed">
          <strong>Menu belum siap.</strong> {loadError} Pastikan migration{" "}
          <span className="font-mono">0011_banners.sql</span> dijalankan di
          Supabase SQL Editor.
        </div>
      )}

      <details className="bg-white rounded-2xl border border-cream-warm mb-6 overflow-hidden">
        <summary className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-forest cursor-pointer hover:bg-cream-warm/50 transition-colors">
          <Icon name="plus" size={14} /> Tambah Banner Baru
        </summary>
        <div className="p-4 md:p-5 border-t border-cream-warm">
          <BannerForm />
        </div>
      </details>

      <div className="space-y-3">
        {banners?.length === 0 && (
          <p className="text-sm text-warm-gray bg-white rounded-2xl border border-cream-warm p-6 text-center">
            Belum ada banner. Tambahkan lewat form di atas.
          </p>
        )}

        {banners?.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl p-4 border border-cream-warm flex flex-wrap md:flex-nowrap items-center gap-4"
          >
            <div className="w-full md:w-64 lg:w-80 h-28 md:h-20 rounded-xl overflow-hidden bg-cream-warm shrink-0">
              <img
                src={b.image_url}
                alt={b.title || "Banner"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-noir truncate">
                {b.title || "(tanpa judul)"}
              </div>
              <div className="text-[11px] md:text-xs text-warm-gray flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                {b.link && (
                  <>
                    <Link
                      href={b.link}
                      className="text-forest hover:underline truncate"
                    >
                      {b.link}
                    </Link>
                    <span>•</span>
                  </>
                )}
                <span>Urutan: {b.sort_order}</span>
                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                    b.active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {b.active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <form action={toggleBanner}>
                <input type="hidden" name="id" value={b.id} />
                <input type="hidden" name="active" value={String(!b.active)} />
                <button
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    b.active
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  }`}
                >
                  {b.active ? "Nonaktifkan" : "Aktifkan"}
                </button>
              </form>
              <form action={deleteBanner}>
                <input type="hidden" name="id" value={b.id} />
                <button className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-all">
                  Hapus
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}