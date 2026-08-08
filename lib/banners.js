import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

// Banner dashboard (dikelola admin, upload gambar — raw URL GitHub).
// Aman dibaca publik. Cache tag "banners" di-invalidate oleh aksi admin.
const CACHE_TAGS = ["banners", "catalog"];
const CACHE_REVALIDATE = 30;

async function loadBanners() {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("banners")
      .select("id, image_url, title, link, sort_order, active")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []).map((b) => ({
      id: b.id,
      imageUrl: b.image_url,
      title: b.title || "",
      link: b.link || null,
      sortOrder: b.sort_order || 0,
    }));
  } catch {
    return [];
  }
}

export const getBanners = unstable_cache(loadBanners, ["catalog-banners"], {
  revalidate: CACHE_REVALIDATE,
  tags: CACHE_TAGS,
});