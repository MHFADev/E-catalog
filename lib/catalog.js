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
      location:
        s.location_lat != null && s.location_lng != null
          ? { lat: Number(s.location_lat), lng: Number(s.location_lng) }
          : null,
    }));
  } catch {
    return sellersJson;
  }
}

// ===== [RATING PRODUK] Rata-rata rating per produk =====
// Dipakai untuk menampilkan bintang rating pada kartu produk di katalog.
// Menggabungkan rating dari tabel reviews (DB) dengan fallback data/reviews.json,
// hasilnya berupa map { productId: rata-rataRating }.
export async function getRatingsMap() {
  const map = {};
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("product_id, rating")
      .eq("status", "approved");
    if (!error && data?.length) {
      const sums = {};
      const counts = {};
      for (const r of data) {
        sums[r.product_id] = (sums[r.product_id] || 0) + r.rating;
        counts[r.product_id] = (counts[r.product_id] || 0) + 1;
      }
      for (const id of Object.keys(sums)) {
        map[id] = sums[id] / counts[id];
      }
    }
  } catch {
    // DB gagal -> fallback ke JSON di bawah
  }
  // [RATING PRODUK] Fallback JSON hanya untuk produk yang belum punya rating di DB
  // (mis. produk contoh 1-15), agar angkanya tidak tercampur dengan rating DB.
  const sums = {};
  const counts = {};
  for (const r of reviewsJson) {
    if (!(r.productId in map)) {
      sums[r.productId] = (sums[r.productId] || 0) + r.rating;
      counts[r.productId] = (counts[r.productId] || 0) + 1;
    }
  }
  for (const id of Object.keys(sums)) {
    map[id] = sums[id] / counts[id];
  }
  return map;
}

export async function getProducts() {
  // [RATING PRODUK] Ambil rata-rata rating sekali, lalu ditempel ke setiap produk
  // supaya kartu di katalog bisa menampilkan bintang rating di bawah harga.
  const ratings = await getRatingsMap();
  const withRating = (p) => ({
    ...p,
    rating: ratings[p.id] || 0,
  });
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, sellers(name)")
      .order("name");
    if (error) throw error;
    if (!data.length) return productsJson.map((p) => withRating({
      ...p,
      sellerName: sellersJson.find((s) => s.id === p.sellerId)?.name || "",
    }));
    const fromDb = data.map((row) => withRating(mapProduct(row)));
    // [GABUNG DATA] Produk dari DB digabung dengan produk dari JSON yang belum ada
    // di DB (mis. produk contoh 1-15 yang hanya ada di data/products.json).
    const dbIds = new Set(fromDb.map((p) => p.id));
    const extra = productsJson
      .filter((p) => !dbIds.has(p.id))
      .map((p) => withRating({
        ...p,
        sellerName: sellersJson.find((s) => s.id === p.sellerId)?.name || "",
      }));
    return [...fromDb, ...extra];
  } catch {
    return productsJson.map((p) => withRating({
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
