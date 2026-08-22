import Icon from "@/components/common/Icon";
import { createAdminClient } from "@/lib/supabase/admin";
import { approveJoin, rejectJoin, deleteJoin } from "../actions";

const statusBadge = {
  pending: "bg-amber-100 text-amber-700",
  contacted: "bg-blue-100 text-blue-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-gray-100 text-gray-500",
};

const statusLabel = {
  pending: "Menunggu",
  contacted: "Dihubungi",
  approved: "Disetujui",
  rejected: "Ditolak",
};

export default async function AdminJoinPage() {
  let joins = [];
  let errorMsg = null;
  const supabase = await createAdminClient();
  try {
    const { data, error } = await supabase
      .from("join_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    joins = data || [];
  } catch (err) {
    errorMsg = err?.message || "Gagal membaca permintaan gabung.";
  }

  const pendingCount = joins?.filter((j) => j.status === "pending").length ?? 0;
  const missingKey = /SERVICE_ROLE_KEY|belum diset/i.test(errorMsg || "");

  return (
    <div>
      <h2 className="text-sm md:text-base font-bold text-noir mb-1">
        Permintaan Gabung UMKM ({joins?.length ?? 0})
      </h2>

      {errorMsg ? (
        <div className="mb-4 text-xs bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 leading-relaxed text-amber-800">
          {missingKey ? (
            <>
              <strong>Panel admin belum dapat mengakses database.</strong> Setel{" "}
              <span className="font-mono">SUPABASE_SERVICE_ROLE_KEY</span> di
              Vercel (Project → Settings → Environment Variables) & di{" "}
              <span className="font-mono">.env.local</span>, lalu redeploy.
            </>
          ) : (
            <>
              <strong>Gagal membaca data.</strong> {errorMsg}{" "}
              {/join_requests|relation/i.test(errorMsg) &&
                "Pastikan semua migration (0001–0012) sudah dijalankan di Supabase SQL Editor."}
            </>
          )}
        </div>
      ) : null}

      {pendingCount > 0 && (
        <p className="text-xs text-amber-700 mb-4">
          {pendingCount} permintaan menunggu — klik <span className="font-semibold text-emerald-600">Terima</span> untuk
          menyetujui dan otomatis membuat toko + akun penjual.
        </p>
      )}

      <div className="space-y-3">
        {joins?.length === 0 && (
          <p className="text-sm text-warm-gray bg-white rounded-2xl border border-cream-warm p-6 text-center">
            Belum ada permintaan gabung.
          </p>
        )}

        {joins?.map((j) => (
          <div
            key={j.id}
            className="bg-white rounded-2xl p-4 border border-cream-warm"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
              <span className="text-sm font-semibold text-noir">
                {j.business_name}
              </span>
              <a
                href={`https://wa.me/${(j.whatsapp || "").replace(/^0/, "62")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-forest hover:underline"
              >
                <Icon name="whatsapp" size={12} /> {j.whatsapp}
              </a>
              <span className="text-[10px] md:text-xs text-warm-gray">
                {new Date(j.created_at).toLocaleString("id-ID")}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${statusBadge[j.status]}`}
              >
                {statusLabel[j.status]}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-noir-soft mb-2">
              {j.owner_name && <div>Pemilik: {j.owner_name}</div>}
              {j.email && <div>Email: {j.email}</div>}
              {j.business_type && <div>Bidang usaha: {j.business_type}</div>}
              {j.category_product && (
                <div>Produk / layanan: {j.category_product}</div>
              )}
              {j.address && <div>Lokasi: {j.address}</div>}
              {j.service_area && <div>Area layanan: {j.service_area}</div>}
              {j.business_hours && <div>Jam operasional: {j.business_hours}</div>}
              {j.instagram_handle && <div>Media sosial: {j.instagram_handle}</div>}
            </div>

            <div className="flex flex-wrap gap-3">
              {j.product_image && (
                <img
                  src={j.product_image}
                  alt="Foto produk"
                  className="h-20 w-20 object-cover rounded-xl border border-cream-warm"
                />
              )}
              {(j.description || j.notes) && (
                <div className="min-w-[200px] flex-1 space-y-1.5 text-xs leading-relaxed text-cool-gray md:text-sm">
                  {j.description && <p>{j.description}</p>}
                  {j.notes && (
                    <p className="rounded-lg bg-cream-pure px-2.5 py-2 text-[11px] text-warm-gray">
                      <span className="font-semibold text-noir-soft">Catatan pemohon:</span> {j.notes}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-cream-warm">
              {j.status !== "approved" && (
                <form action={approveJoin}>
                  <input type="hidden" name="id" value={j.id} />
                  <button className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-all">
                    <Icon name="check" size={13} /> Terima
                  </button>
                </form>
              )}
              {j.status !== "rejected" && (
                <form action={rejectJoin}>
                  <input type="hidden" name="id" value={j.id} />
                  <button className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full bg-red-600 text-white hover:bg-red-700 transition-all">
                    <Icon name="close" size={13} /> Tolak
                  </button>
                </form>
              )}
              <form action={deleteJoin}>
                <input type="hidden" name="id" value={j.id} />
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-forest/10 text-forest hover:bg-forest/20 transition-all">
                  <Icon name="trashFilled" size={13} /> Hapus
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}