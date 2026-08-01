import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ArticleForm from "./ArticleForm";
import { deleteArticle } from "../actions";

export default async function AdminArticlesPage() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false });

  return (
    <div>
      <h2 className="text-sm md:text-base font-bold text-noir mb-4">
        Kelola Artikel ({articles?.length ?? 0})
      </h2>

      <details className="bg-white rounded-2xl border border-cotton-warm mb-6 overflow-hidden">
        <summary className="px-4 py-3 text-sm font-semibold text-cherry cursor-pointer hover:bg-cotton-warm/50 transition-colors">
          + Tulis Artikel Baru
        </summary>
        <div className="p-4 md:p-5 border-t border-cotton-warm">
          <ArticleForm />
        </div>
      </details>

      <div className="space-y-3">
        {articles?.length === 0 && (
          <p className="text-sm text-warm-gray bg-white rounded-2xl border border-cotton-warm p-6 text-center">
            Belum ada artikel.
          </p>
        )}

        {articles?.map((a) => (
          <div
            key={a.id}
            className="bg-white rounded-2xl p-4 border border-cotton-warm flex flex-wrap items-center gap-3"
          >
            <div className="w-16 h-12 rounded-xl overflow-hidden bg-cotton-warm shrink-0">
              {a.image && (
                <img src={a.image} alt={a.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-noir truncate">
                {a.title}
              </div>
              <div className="text-[11px] md:text-xs text-warm-gray">
                {a.author} • {a.published_at} •{" "}
                <span className={a.published ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                  {a.published ? "Published" : "Draft"}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/artikel/${a.slug}`}
                target="_blank"
                className="px-3 py-1.5 text-xs font-semibold rounded-full bg-cotton-warm text-noir-soft hover:bg-cotton transition-all"
              >
                Lihat
              </Link>
              <Link
                href={`/admin/articles/${a.id}`}
                className="px-3 py-1.5 text-xs font-semibold rounded-full bg-cotton-warm text-noir-soft hover:bg-cotton transition-all"
              >
                Edit
              </Link>
              <form action={deleteArticle}>
                <input type="hidden" name="id" value={a.id} />
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
