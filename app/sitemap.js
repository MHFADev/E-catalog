import { getProducts, getArticles } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/siteUrl";

export default async function sitemap() {
  const siteUrl = getSiteUrl();
  const [products, articles] = await Promise.all([getProducts(), getArticles()]);
  const now = new Date();

  const staticPages = ["", "/catalog", "/artikel", "/gabung", "/about"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/catalog" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const productPages = products.map((product) => ({
    url: `${siteUrl}/product/${product.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const articlePages = articles.map((article) => ({
    url: `${siteUrl}/artikel/${article.slug}`,
    lastModified: article.published_at ? new Date(article.published_at) : now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...articlePages];
}
