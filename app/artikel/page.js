import Link from "next/link";
import Icon from "@/components/common/Icon";
import LegacyArtikel from "@/components/article/LegacyArtikel";
import { getArticles } from "@/lib/catalog";

export default async function ArtikelPage() {
  const articles = await getArticles();

  // Belum ada artikel dari database -> tampilkan konten statis lama
  if (!articles.length) return <LegacyArtikel />;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-16">
      <div className="text-center mb-10">
        <span className="inline-block px-3 py-1 mb-3 bg-cherry text-white text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full">
          UMKM Kemayoran
        </span>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-2">
          <span className="text-cherry">Artikel</span> &amp; Cerita
        </h1>
        <p className="text-sm md:text-base text-warm-gray max-w-xl mx-auto">
          Berita, cerita sukses, dan informasi terbaru seputar UMKM Kemayoran.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`/artikel/${a.slug}`}
            className="bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-cotton-warm shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <div className="aspect-[16/9] bg-cotton-warm overflow-hidden">
              {a.image && (
                <img
                  src={a.image}
                  alt={a.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-4 md:p-6">
              <div className="flex items-center gap-3 text-[10px] md:text-xs text-warm-gray mb-2">
                <span className="flex items-center gap-1">
                  <Icon name="calendar" size={12} /> {a.published_at}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="user" size={12} /> {a.author}
                </span>
              </div>
              <h2 className="text-sm md:text-lg font-bold text-noir mb-1.5 leading-snug">
                {a.title}
              </h2>
              {a.excerpt && (
                <p className="text-xs md:text-sm text-cool-gray leading-relaxed line-clamp-2">
                  {a.excerpt}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
