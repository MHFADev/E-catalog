import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ArticleForm from "../ArticleForm";

export default async function AdminEditArticlePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (!article) notFound();

  return (
    <div>
      <Link
        href="/admin/articles"
        className="text-xs md:text-sm text-warm-gray hover:text-cherry mb-4 inline-block"
      >
        ← Kembali ke daftar artikel
      </Link>
      <h2 className="text-sm md:text-base font-bold text-noir mb-4">
        Edit Artikel
      </h2>
      <div className="bg-white rounded-2xl border border-cotton-warm p-4 md:p-5">
        <ArticleForm initial={article} />
      </div>
    </div>
  );
}
