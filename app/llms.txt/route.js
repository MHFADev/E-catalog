import { getArticles, getProducts } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/siteUrl";

export const revalidate = 3600;

export async function GET() {
  const siteUrl = getSiteUrl();
  const [articles, products] = await Promise.all([getArticles(), getProducts()]);
  const lines = [
    "# UMKM Kemayoran",
    "",
    "> Katalog digital produk dan usaha lokal UMKM Kemayoran, Gunung Putri, Bogor.",
    "> Situs resmi: " + siteUrl,
    "",
    "## Halaman utama",
    `- Beranda: ${siteUrl}/`,
    `- Katalog produk: ${siteUrl}/catalog`,
    `- Artikel dan cerita: ${siteUrl}/artikel`,
    `- Gabung sebagai UMKM: ${siteUrl}/gabung`,
    "",
    "## Tentang katalog",
    "UMKM Kemayoran membantu masyarakat menemukan produk lokal dan menghubungi pelaku usaha secara langsung. Informasi produk dan artikel yang berstatus publik dikelola melalui panel admin.",
    "",
    "## Artikel publik",
    ...(articles.length
      ? articles.map((article) => `- [${article.title}](${siteUrl}/artikel/${article.slug})${article.excerpt ? `: ${article.excerpt}` : ""}`)
      : ["Belum ada artikel publik." ]),
    "",
    "## Produk publik",
    ...(products.length
      ? products.slice(0, 200).map((product) => `- [${product.name}](${siteUrl}/product/${product.id})${product.description ? `: ${product.description.slice(0, 180)}` : ""}`)
      : ["Belum ada produk publik." ]),
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    `Robots: ${siteUrl}/robots.txt`,
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
