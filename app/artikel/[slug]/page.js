import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/common/Icon";
import { createClient } from "@/lib/supabase/server";

export default async function ArticleDetailPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!article) notFound();

  const paragraphs = article.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article className="bg-cotton">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-14">
        <Link
          href="/artikel"
          className="text-xs md:text-sm text-warm-gray hover:text-cherry inline-flex items-center gap-1 mb-4"
        >
          <Icon name="chevronLeft" size={12} /> Semua Artikel
        </Link>

        <div className="flex items-center gap-3 text-[10px] md:text-xs text-warm-gray mb-3">
          <span className="flex items-center gap-1">
            <Icon name="calendar" size={12} /> {article.published_at}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="user" size={12} /> {article.author || "Tim Pengelola"}
          </span>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-noir mb-4 leading-tight">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="text-sm md:text-base text-warm-gray leading-relaxed mb-6">
            {article.excerpt}
          </p>
        )}

        {article.image && (
          <div className="rounded-2xl md:rounded-3xl overflow-hidden mb-8">
            <img
              src={article.image}
              alt={article.title}
              className="w-full aspect-[16/9] object-cover"
            />
          </div>
        )}

        <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-10 shadow-sm border border-cotton-warm">
          <div className="space-y-4 text-sm md:text-base text-cool-gray leading-relaxed">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/artikel" className="btn-secondary text-sm md:text-base">
            Baca Artikel Lainnya
          </Link>
        </div>
      </div>
    </article>
  );
}
