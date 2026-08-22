import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import categoriesJson from "@/data/categories.json";
import sellersJson from "@/data/sellers.json";
import reviewsJson from "@/data/reviews.json";

// Data layer katalog: produk hanya berasal dari database.
// SEMUA akses baca katalog di-cache di server (unstable_cache) agar pindah halaman
// cepat & database tidak dibanjiri query berulang. Cache di-invalidate via
// `revalidateTag("catalog")` dari server action (admin/penjual) atau kedaluwarsa
// otomatis setelah `revalidate` detik.

const CACHE_TAGS = ["catalog"];
const CACHE_REVALIDATE = 30; // detik; tetap cepat tampil saat berubah karena tag revalidate

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
  isPreOrder: row.is_pre_order === true,
  halalStatus: row.halal_status || null,
  showPrice: row.show_price !== false,
  tags: Array.isArray(row.tags) ? row.tags : [],
  sellerName: row.sellers?.name || "",
});

export const getCategories = unstable_cache(
  async function loadCategories() {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data.length ? data : categoriesJson;
    } catch {
      return categoriesJson;
    }
  },
  ["catalog-categories"],
  { revalidate: CACHE_REVALIDATE, tags: CACHE_TAGS },
);

export const getSellers = unstable_cache(
  async function loadSellers() {
    try {
      const supabase = createPublicClient();
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
        isBlocked: s.is_blocked === true,
        location:
          s.location_lat != null && s.location_lng != null
            ? { lat: Number(s.location_lat), lng: Number(s.location_lng) }
            : null,
      }));
    } catch {
      return sellersJson;
    }
  },
  ["catalog-sellers"],
  { revalidate: CACHE_REVALIDATE, tags: CACHE_TAGS },
);

// ===== [RATING PRODUK] Rata-rata rating per produk =====
const _getRatingsMap = async function loadRatings() {
  const map = {};
  try {
    const supabase = createPublicClient();
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
};

export const getRatingsMap = unstable_cache(_getRatingsMap, ["catalog-ratings"], {
  revalidate: CACHE_REVALIDATE,
  tags: CACHE_TAGS,
});

// Foto produk one-to-many (tabel product_images) -> map product_id => [url, ...].
// Menjadi source of truth foto; kolom products.images dipakai bila belum ada
// baris tambahan pada product_images.
const getProductImagesMap = async function loadProductImages() {
  const map = {};
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("product_images")
      .select("product_id, image_url, sort_order")
      .order("sort_order");
    if (!error && data?.length) {
      for (const img of data) {
        (map[img.product_id] = map[img.product_id] || []).push(img.image_url);
      }
    }
  } catch {
    // DB gagal -> biarkan map kosong dan gunakan kolom products.images.
  }
  return map;
};

const _loadProducts = async function loadProductsData() {
  const ratings = await getRatingsMap();
  const imageMap = await getProductImagesMap();
  const withRating = (p) => ({ ...p, rating: ratings[p.id] || 0 });
  const withImages = (p) =>
    imageMap[p.id]?.length
      ? { ...p, images: imageMap[p.id] }
      : p;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, sellers(name)")
      .order("name");
    if (error) throw error;
    return data.map((row) => withRating(withImages(mapProduct(row))));
  } catch {
    return [];
  }
};

export const getProducts = unstable_cache(_loadProducts, ["catalog-products"], {
  revalidate: CACHE_REVALIDATE,
  tags: CACHE_TAGS,
});

export const getReviews = unstable_cache(
  async function loadReviews(productId) {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("reviews")
        .select(
          "id, product_id, name, rating, comment, date, user_id, profiles(id, username, avatar_url)",
        )
        .eq("status", "approved")
        .eq("product_id", productId)
        .order("date", { ascending: false });
      if (error) throw error;
      return data.map((r) => ({
        id: r.id,
        productId: r.product_id,
        name: r.name,
        // Nama tampilan: username dari tabel profiles (join) bila ada,
        // fallback ke kolom name (komentar lama / tanpa akun).
        username: r.profiles?.username || null,
        avatarUrl: r.profiles?.avatar_url || null,
        rating: r.rating,
        comment: r.comment,
        date: r.date,
        userId: r.user_id,
      }));
    } catch {
      return reviewsJson
        .filter((r) => r.productId === productId)
        .map((r) => ({ ...r, id: undefined }));
    }
  },
  ["catalog-reviews"],
  { revalidate: CACHE_REVALIDATE, tags: CACHE_TAGS },
);

export const getArticles = unstable_cache(
  async function loadArticles() {
    try {
      const supabase = createPublicClient();
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
  },
  ["catalog-articles"],
  { revalidate: CACHE_REVALIDATE, tags: CACHE_TAGS },
);