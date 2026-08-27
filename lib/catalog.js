import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import categoriesJson from "@/data/categories.json";
import sellersJson from "@/data/sellers.json";

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
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("product_id, rating")
      .eq("status", "approved");
    if (error) throw error;

    const sums = {};
    const counts = {};
    for (const review of data || []) {
      sums[review.product_id] = (sums[review.product_id] || 0) + review.rating;
      counts[review.product_id] = (counts[review.product_id] || 0) + 1;
    }

    return Object.fromEntries(
      Object.entries(sums).map(([productId, total]) => [productId, total / counts[productId]]),
    );
  } catch {
    // Rating tidak pernah dipalsukan dari data lokal. Jika database tidak dapat
    // dibaca, tampilkan 0 sampai koneksi publik tersedia kembali.
    return {};
  }
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
      // reviews.user_id merujuk ke auth.users, bukan public.profiles. PostgREST
      // tidak dapat meng-embed profiles lewat relasi yang tidak ada, jadi data
      // profil dimuat terpisah setelah ulasan berhasil dibaca.
      const { data: reviews, error: reviewError } = await supabase
        .from("reviews")
        .select("id, product_id, name, rating, comment, date, user_id")
        .eq("status", "approved")
        .eq("product_id", productId)
        .order("date", { ascending: false });
      if (reviewError) throw reviewError;

      const userIds = [...new Set((reviews || []).map((review) => review.user_id).filter(Boolean))];
      let profilesById = new Map();
      if (userIds.length) {
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", userIds);
        // Profil hanya pelengkap tampilan. Ulasan tetap harus muncul meski
        // avatar atau username tidak tersedia untuk akun lama.
        if (!profileError) {
          profilesById = new Map((profiles || []).map((profile) => [profile.id, profile]));
        }
      }

      return (reviews || []).map((review) => {
        const profile = profilesById.get(review.user_id);
        return {
          id: review.id,
          productId: review.product_id,
          name: review.name,
          username: profile?.username || null,
          avatarUrl: profile?.avatar_url || null,
          rating: review.rating,
          comment: review.comment,
          date: review.date,
          userId: review.user_id,
        };
      });
    } catch (error) {
      console.error("Gagal memuat ulasan publik:", error?.message || error);
      // Ulasan publik hanya berasal dari tabel reviews di database.
      return [];
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