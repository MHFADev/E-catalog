import Link from "next/link";
import Icon from "@/components/common/Icon";
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
        className="flex items-center gap-1.5 text-xs md:text-sm text-warm-gray hover:text-forest mb-4 inline-block"
      >
        <Icon name="chevronLeft" size={14} /> Kembali ke daftar artikel
      </Link>
      <h2 className="text-sm md:text-base font-bold text-noir mb-4">
        Edit Artikel
      </h2>
      <div className="bg-white rounded-2xl border border-cream-warm p-4 md:p-5">
        <ArticleForm initial={article} />
      </div>
    </div>
  );
}
