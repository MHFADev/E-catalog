import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import categoriesJson from "@/data/categories.json";
import sellersJson from "@/data/sellers.json";
import productsJson from "@/data/products.json";
import reviewsJson from "@/data/reviews.json";

// ponytail: server data layer. DB-first, JSON fallback saat env kosong / query gagal.
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
        // Payment methods
        bankName: s.bank_name,
        bankAccountNumber: s.bank_account_number,
        bankAccountName: s.bank_account_name,
        ewalletType: s.ewallet_type,
        ewalletNumber: s.ewallet_number,
        qrisImageUrl: s.qris_image_url,
        enabledPaymentMethods: Array.isArray(s.enabled_payment_methods) ? s.enabled_payment_methods : [],
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

const _loadProducts = async function loadProductsData() {
  const ratings = await getRatingsMap();
  const withRating = (p) => ({ ...p, rating: ratings[p.id] || 0 });
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, sellers(name)")
      .order("name");
    if (error) throw error;
    if (!data.length)
      return productsJson.map((p) =>
        withRating({
          ...p,
          sellerName: sellersJson.find((s) => s.id === p.sellerId)?.name || "",
        }),
      );
    const fromDb = data.map((row) => withRating(mapProduct(row)));
    const dbIds = new Set(fromDb.map((p) => p.id));
    const extra = productsJson
      .filter((p) => !dbIds.has(p.id))
      .map((p) =>
        withRating({
          ...p,
          sellerName: sellersJson.find((s) => s.id === p.sellerId)?.name || "",
        }),
      );
    return [...fromDb, ...extra];
  } catch {
    return productsJson.map((p) =>
      withRating({
        ...p,
        sellerName: sellersJson.find((s) => s.id === p.sellerId)?.name || "",
      }),
    );
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