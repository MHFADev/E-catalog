import { createClient } from "@/lib/supabase/server";
import categoriesJson from "@/data/categories.json";
import sellersJson from "@/data/sellers.json";
import productsJson from "@/data/products.json";
import reviewsJson from "@/data/reviews.json";

// ponytail: server data layer. DB-first, JSON fallback saat env kosong / query gagal
// agar `npm run dev` tetap jalan tanpa konfigurasi. Hapus fallback saat DB sudah pasti.

const mapProduct = (row) => ({
  id: row.id,
  name: row.name,
  categoryId: row.category_id,
  sellerId: row.seller_id,
  price: row.price === null || row.price === undefined ? null : Number(row.price),
  priceUnit: row.price_unit,
  description: row.description,
  images: Array.isArray(row.images) ? row.images : [],
  isFeatured: row.is_featured,
  isAvailable: row.is_available,
  tags: Array.isArray(row.tags) ? row.tags : [],
  sellerName: row.sellers?.name || "",
});

export async function getCategories() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) throw error;
    return data.length ? data : categoriesJson;
  } catch {
    return categoriesJson;
  }
}

export async function getSellers() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("sellers").select("*").order("name");
    if (error) throw error;
    if (!data.length) return sellersJson;
    return data.map((s) => ({
      id: s.id,
      name: s.name,
      owner: s.owner,
      whatsapp: s.whatsapp,
      whatsappAlt: s.whatsapp_alt,
      address: s.address,
      description: s.description,
      logo: s.logo,
    }));
  } catch {
    return sellersJson;
  }
}

export async function getProducts() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, sellers(name)")
      .order("name");
    if (error) throw error;
    if (!data.length) return productsJson.map((p) => ({
      ...p,
      sellerName: sellersJson.find((s) => s.id === p.sellerId)?.name || "",
    }));
    const fromDb = data.map(mapProduct);
    // [GABUNG DATA] Produk dari DB digabung dengan produk dari JSON yang belum ada
    // di DB (mis. produk contoh 1-15 yang hanya ada di data/products.json).
    const dbIds = new Set(fromDb.map((p) => p.id));
    const extra = productsJson
      .filter((p) => !dbIds.has(p.id))
      .map((p) => ({
        ...p,
        sellerName: sellersJson.find((s) => s.id === p.sellerId)?.name || "",
      }));
    return [...fromDb, ...extra];
  } catch {
    return productsJson.map((p) => ({
      ...p,
      sellerName: sellersJson.find((s) => s.id === p.sellerId)?.name || "",
    }));
  }
}

export async function getReviews(productId) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("id, product_id, name, rating, comment, date")
      .eq("status", "approved")
      .eq("product_id", productId)
      .order("date", { ascending: false });
    if (error) throw error;
    return data.map((r) => ({
      id: r.id,
      productId: r.product_id,
      name: r.name,
      rating: r.rating,
      comment: r.comment,
      date: r.date,
    }));
  } catch {
    return reviewsJson
      .filter((r) => r.productId === productId)
      .map((r) => ({ ...r, id: undefined }));
  }
}

export async function getArticles() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}
