import { createClient } from "@/lib/supabase/server";
import { setJoinStatus, deleteJoin } from "../actions";

const statusBadge = {
  pending: "bg-amber-100 text-amber-700",
  contacted: "bg-blue-100 text-blue-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-gray-100 text-gray-500",
};

const statuses = ["pending", "contacted", "approved", "rejected"];

export default async function AdminJoinPage() {
  const supabase = await createClient();
  const { data: joins } = await supabase
    .from("join_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h2 className="text-sm md:text-base font-bold text-noir mb-4">
        Permintaan Gabung UMKM ({joins?.length ?? 0})
      </h2>

      <div className="space-y-3">
        {joins?.length === 0 && (
          <p className="text-sm text-warm-gray bg-white rounded-2xl border border-cotton-warm p-6 text-center">
            Belum ada permintaan gabung.
          </p>
        )}

        {joins?.map((j) => (
          <div
            key={j.id}
            className="bg-white rounded-2xl p-4 border border-cotton-warm"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
              <span className="text-sm font-semibold text-noir">
                {j.business_name}
              </span>
              <a
                href={`https://wa.me/${j.whatsapp.replace(/^0/, "62")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cherry hover:underline"
              >
                {j.whatsapp}
              </a>
              <span className="text-[10px] md:text-xs text-warm-gray">
                {new Date(j.created_at).toLocaleString("id-ID")}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${statusBadge[j.status]}`}
              >
                {j.status}
              </span>
            </div>
            <div className="text-xs text-noir-soft mb-1">
              Pemilik: {j.owner_name || "-"}
            </div>
            {j.product_type && (
              <div className="text-xs text-noir-soft mb-1">
                Produk: {j.product_type}
              </div>
            )}
            {j.notes && (
              <p className="text-xs md:text-sm text-cool-gray leading-relaxed mb-2">
                {j.notes}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {statuses
                .filter((s) => s !== j.status)
                .map((s) => (
                  <form key={s} action={setJoinStatus}>
                    <input type="hidden" name="id" value={j.id} />
                    <input type="hidden" name="status" value={s} />
                    <button className="px-3 py-1.5 text-xs font-semibold rounded-full bg-cotton-warm text-noir-soft hover:bg-cotton transition-all capitalize">
                      {s}
                    </button>
                  </form>
                ))}
              <form action={deleteJoin}>
                <input type="hidden" name="id" value={j.id} />
                <button className="px-3 py-1.5 text-xs font-semibold rounded-full bg-cherry/10 text-cherry hover:bg-cherry/20 transition-all">
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
