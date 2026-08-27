import { createAdminClient } from "@/lib/supabase/admin";
import Icon from "@/components/common/Icon";
import DeleteConfirmButton from "@/components/common/DeleteConfirmButton";
import { setReviewStatus, deleteReview } from "../actions";

const statusBadge = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-gray-100 text-gray-500",
};

function Stars({ value }) {
  return (
    <span className="text-xs">
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          name="starFilled"
          size={12}
          className={i <= value ? "text-amber-500" : "text-muted/30"}
        />
      ))}
    </span>
  );
}

export default async function AdminReviewsPage() {
  const supabase = await createAdminClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, products(name), profiles(username)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h2 className="text-sm md:text-base font-bold text-noir mb-4">
        Moderasi Komentar ({reviews?.length ?? 0})
      </h2>

      <div className="space-y-3">
        {reviews?.length === 0 && (
          <p className="text-sm text-warm-gray bg-white rounded-2xl border border-cream-warm p-6 text-center">
            Belum ada komentar.
          </p>
        )}

        {reviews?.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-2xl p-4 border border-cream-warm"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
              <span className="text-sm font-semibold text-noir">{r.name}</span>
              {r.profiles?.username && (
                <span className="text-[10px] font-mono font-semibold text-forest bg-forest/5 border border-forest/10 rounded-full px-2 py-0.5">
                  @{r.profiles.username}
                </span>
              )}
              <Stars value={r.rating} />
              <span className="text-[10px] md:text-xs text-warm-gray">
                {r.date}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${statusBadge[r.status]}`}
              >
                {r.status}
              </span>
            </div>
            <p className="text-xs md:text-sm text-cool-gray mb-2 leading-relaxed">
              {r.comment}
            </p>
            <div className="text-[11px] text-warm-gray mb-2">
              Produk: <span className="text-noir-soft">{r.products?.name ?? r.product_id}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {r.status !== "approved" && (
                <form action={setReviewStatus}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value="approved" />
                  <button className="px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-all">
                    Setujui
                  </button>
                </form>
              )}
              {r.status !== "rejected" && (
                <form action={setReviewStatus}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <button className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all">
                    Tolak
                  </button>
                </form>
              )}
              <DeleteConfirmButton
                action={deleteReview}
                id={r.id}
                entityLabel="ulasan ini"
                description={`Ulasan dari ${r.name} untuk ${r.products?.name || "produk ini"} akan dihapus permanen dan tidak lagi tampil di katalog.`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
