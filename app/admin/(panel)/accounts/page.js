import { createClient } from "@/lib/supabase/server";
import {
  approveSellerAccount,
  rejectSellerAccount,
  setSellerAccountBlocked,
  deleteSellerAccount,
} from "../actions";

const statusBadge = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-gray-100 text-gray-500",
  blocked: "bg-red-100 text-red-700",
};

export default async function AdminAccountsPage() {
  const supabase = await createClient();
  const [{ data: accounts }, { data: sellers }] = await Promise.all([
    supabase.from("seller_accounts").select("*, sellers(name)").order("created_at", { ascending: false }),
    supabase.from("sellers").select("id, name").order("name"),
  ]);

  return (
    <div>
      <h2 className="text-sm md:text-base font-bold text-noir mb-4">
        Akun Penjual / Pemilik UMKM ({accounts?.length ?? 0})
      </h2>
      <p className="text-xs text-warm-gray mb-4 leading-relaxed">
        Semua akun yang terdaftar sebagai penjual UMKM. Kelola status akun
        (setujui, tolak, blokir) atau hapus seluruh data UMKM-nya.
      </p>

      <div className="space-y-3">
        {accounts?.length === 0 && (
          <p className="text-sm text-warm-gray bg-white rounded-2xl border border-cream-warm p-6 text-center">
            Belum ada akun penjual terdaftar.
          </p>
        )}

        {accounts?.map((a) => (
          <div
            key={a.user_id}
            className="bg-white rounded-2xl p-4 border border-cream-warm"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
              <span className="text-sm font-semibold text-noir">
                {a.business_name}
              </span>
              {a.whatsapp && (
                <a
                  href={`https://wa.me/${a.whatsapp.replace(/^0/, "62")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-forest hover:underline"
                >
                  {a.whatsapp}
                </a>
              )}
              <span className="text-[10px] md:text-xs text-warm-gray">
                {new Date(a.created_at).toLocaleString("id-ID")}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${statusBadge[a.status]}`}
              >
                {a.status}
              </span>
            </div>

            <div className="text-[11px] md:text-xs text-warm-gray mb-2 space-y-0.5">
              <div>
                ID Akun:{" "}
                <span className="font-mono font-semibold text-noir-soft">
                  {a.user_id}
                </span>
              </div>
              <div>
                Terhubung ke:{" "}
                <span className="text-noir-soft">{a.sellers?.name ?? "—"}</span>
              </div>
            </div>

            {a.status !== "approved" && a.status !== "blocked" && (
              <form action={approveSellerAccount} className="flex flex-wrap gap-2 items-end">
                <input type="hidden" name="userId" value={a.user_id} />
                <div>
                  <div className="text-[10px] text-warm-gray mb-0.5">Hubungkan ke toko:</div>
                  <select
                    name="sellerId"
                    className="bg-cream-pure border border-cream-warm rounded-lg px-2 py-1.5 text-xs text-noir"
                  >
                    <option value="">— pilih toko —</option>
                    {sellers?.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-[10px] text-warm-gray mb-0.5">Atau nama toko baru:</div>
                  <input
                    name="newSellerName"
                    placeholder="Nama UMKM baru"
                    className="bg-cream-pure border border-cream-warm rounded-lg px-2 py-1.5 text-xs text-noir w-44"
                  />
                </div>
                <div>
                  <div className="text-[10px] text-warm-gray mb-0.5">WhatsApp toko:</div>
                  <input
                    name="newSellerWa"
                    placeholder="628..."
                    className="bg-cream-pure border border-cream-warm rounded-lg px-2 py-1.5 text-xs text-noir w-32"
                  />
                </div>
                <button className="px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-all">
                  Setujui
                </button>
              </form>
            )}

            {a.status === "approved" && (
              <div className="text-xs text-emerald-700">
                Akun aktif — pemilik dapat mengelola produk toko ini.
              </div>
            )}
            {a.status === "blocked" && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                Akun diblokir — pemilik tidak dapat mengakses area penjual.
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-cream-warm">
              {a.status === "approved" && (
                <form action={rejectSellerAccount}>
                  <input type="hidden" name="userId" value={a.user_id} />
                  <button className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-all">
                    Tolak
                  </button>
                </form>
              )}
              <form action={setSellerAccountBlocked}>
                <input type="hidden" name="userId" value={a.user_id} />
                {(a.status === "blocked" && (
                  <>
                    <input type="hidden" name="blocked" value="false" />
                  </>
                )) || (
                  <input type="hidden" name="blocked" value="true" />
                )}
                <button
                  className={
                    a.status === "blocked"
                      ? "px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-all"
                      : "px-3 py-1.5 text-xs font-semibold rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                  }
                >
                  {a.status === "blocked" ? "Buka Blokir" : "Blokir"}
                </button>
              </form>
              <form action={deleteSellerAccount}>
                <input type="hidden" name="userId" value={a.user_id} />
                <button className="px-3 py-1.5 text-xs font-semibold rounded-full bg-noir-soft/10 text-noir-soft hover:bg-noir-soft/20 transition-all">
                  Hapus Akun
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}