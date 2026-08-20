"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/auth";

async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized: anda bukan admin");
  }
}

const parseList = (v) =>
  (v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

// ===== Reviews =====
export async function setReviewStatus(formData) {
  await requireAdmin();
  const id = formData.get("id");
  const status = formData.get("status");
  if (!id || !["approved", "rejected"].includes(status)) throw new Error("Parameter salah");

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("reviews")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  revalidateTag("catalog");
}

export async function deleteReview(formData) {
  await requireAdmin();
  const id = formData.get("id");
  if (!id) throw new Error("Parameter salah");

  const supabase = await createAdminClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}

// ===== Products =====
export async function saveProduct(formData) {
  await requireAdmin();
  const id = (formData.get("id") || "").toString().trim();
  const name = (formData.get("name") || "").toString().trim();
  const categoryId = (formData.get("categoryId") || "").toString().trim();
  const sellerId = (formData.get("sellerId") || "").toString().trim();
  const price = (formData.get("price") || "").toString().trim();
  const priceUnit = (formData.get("priceUnit") || "").toString().trim();
  const description = (formData.get("description") || "").toString().trim();
  const images = parseList(formData.get("images"));
  const tags = parseList(formData.get("tags"));
  const isFeatured = formData.get("isFeatured") === "on";
  const isAvailable = formData.get("isAvailable") === "on";
  const showPrice = formData.get("showPrice") === "on";
  const isPreOrder = formData.get("isPreOrder") === "on";
  const halalStatus = (formData.get("halalStatus") || "").toString().trim();

  if (!name || !categoryId || !sellerId) throw new Error("Nama, kategori, dan toko wajib diisi");
  if (!images.length) throw new Error("Minimal 1 gambar (pisahkan dengan koma)");

  const payload = {
    name,
    category_id: categoryId,
    seller_id: sellerId,
    price: price === "" ? null : Number(price),
    price_unit: priceUnit || null,
    description: description || null,
    images,
    tags,
    is_featured: isFeatured,
    is_available: isAvailable,
    show_price: showPrice,
    is_pre_order: isPreOrder,
    halal_status: halalStatus || null,
  };

  // Kolom products.id ber-tipe text dan NOT NULL tanpa default, jadi
  // saat insert produk baru wajib menyertakan id (contoh: "prod-<timestamp>").
  if (!id) payload.id = `prod-${Date.now()}`;

  const supabase = await createAdminClient();
  const productId = id || payload.id;
  const { error } = id
    ? await supabase
        .from("products")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id)
    : await supabase.from("products").insert(payload);
  if (error) throw new Error(error.message);

  // Sinkronkan foto one-to-many (product_images) agar konsisten.
  await supabase.from("product_images").delete().eq("product_id", productId);
  if (images.length) {
    const rows = images.map((url, i) => ({
      product_id: productId,
      image_url: url,
      sort_order: i,
    }));
    const { error: imgErr } = await supabase
      .from("product_images")
      .insert(rows);
    if (imgErr) throw new Error(imgErr.message);
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidateTag("catalog");
}

export async function toggleProduct(formData) {
  await requireAdmin();
  const id = formData.get("id");
  const field = formData.get("field");
  const value = formData.get("value") === "true";
  if (!id || !["is_featured", "is_available"].includes(field)) throw new Error("Parameter salah");

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("products")
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidateTag("catalog");
}

export async function deleteProduct(formData) {
  await requireAdmin();
  const id = formData.get("id");
  if (!id) throw new Error("Parameter salah");

  const supabase = await createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidateTag("catalog");
}

// ===== Sellers =====
export async function saveSeller(formData) {
  await requireAdmin();
  const id = (formData.get("id") || "").toString().trim();
  const name = (formData.get("name") || "").toString().trim();
  const owner = (formData.get("owner") || "").toString().trim();
  const whatsapp = (formData.get("whatsapp") || "").toString().trim();
  const whatsappAlt = (formData.get("whatsappAlt") || "").toString().trim();
  const address = (formData.get("address") || "").toString().trim();
  const description = (formData.get("description") || "").toString().trim();
  const logo = (formData.get("logo") || "").toString().trim();
  const videoUrl = (formData.get("videoUrl") || "").toString().trim();

  // Payment methods
  const enabledPaymentMethods = formData.getAll("enabledPaymentMethods").filter(Boolean);
  const bankName = (formData.get("bankName") || "").toString().trim();
  const bankAccountNumber = (formData.get("bankAccountNumber") || "").toString().trim();
  const bankAccountName = (formData.get("bankAccountName") || "").toString().trim();
  const ewalletType = (formData.get("ewalletType") || "").toString().trim();
  const ewalletNumber = (formData.get("ewalletNumber") || "").toString().trim();
  const qrisImageUrl = (formData.get("qrisImage") || "").toString().trim();

  if (!name || !whatsapp) throw new Error("Nama dan WhatsApp wajib diisi");

  const payload = {
    name,
    owner: owner || null,
    whatsapp,
    whatsapp_alt: whatsappAlt || null,
    address: address || null,
    description: description || null,
    logo: logo || null,
    video_url: videoUrl || null,
    // Payment methods
    bank_name: bankName || null,
    bank_account_number: bankAccountNumber || null,
    bank_account_name: bankAccountName || null,
    ewallet_type: ewalletType || null,
    ewallet_number: ewalletNumber || null,
    qris_image_url: qrisImageUrl || null,
    enabled_payment_methods: enabledPaymentMethods.length ? enabledPaymentMethods : [],
  };

  const supabase = await createAdminClient();
  const { error } = id
    ? await supabase.from("sellers").update(payload).eq("id", id)
    : await supabase.from("sellers").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/sellers");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidateTag("catalog");
}

export async function deleteSeller(formData) {
  await requireAdmin();
  const id = formData.get("id");
  if (!id) throw new Error("Parameter salah");

  const supabase = await createAdminClient();
  const { error } = await supabase.from("sellers").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/sellers");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidateTag("catalog");
}

// ===== Messages =====
export async function toggleMessageRead(formData) {
  await requireAdmin();
  const id = formData.get("id");
  const value = formData.get("value") === "true";
  if (!id) throw new Error("Parameter salah");

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("messages")
    .update({ is_read: value })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/messages");
}

export async function deleteMessage(formData) {
  await requireAdmin();
  const id = formData.get("id");
  if (!id) throw new Error("Parameter salah");

  const supabase = await createAdminClient();
  const { error } = await supabase.from("messages").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/messages");
}

// ===== Categories =====
export async function saveCategory(formData) {
  // Page already protected by AdminLayout isAdmin() check
  const id = (formData.get("id") || "").toString().trim();
  const name = (formData.get("name") || "").toString().trim();
  const icon = (formData.get("icon") || "").toString().trim();
  const image = (formData.get("image") || "").toString().trim();
  const description = (formData.get("description") || "").toString().trim();

  if (!name) throw new Error("Nama kategori wajib diisi");

  const slug =
    id ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const payload = { name, icon: icon || null, image: image || null, description: description || null };

  const supabase = await createAdminClient();
  const { error } = id
    ? await supabase.from("categories").update(payload).eq("id", id)
    : await supabase.from("categories").insert({ id: slug, ...payload });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidateTag("catalog");
}

export async function deleteCategory(formData) {
  // Page already protected by AdminLayout isAdmin() check
  const id = formData.get("id");
  if (!id) throw new Error("Parameter salah");

  const supabase = await createAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidateTag("catalog");
}

// ===== Articles =====
export async function saveArticle(formData) {
  await requireAdmin();
  const id = (formData.get("id") || "").toString().trim();
  const title = (formData.get("title") || "").toString().trim();
  const slug = (formData.get("slug") || "").toString().trim();
  const image = (formData.get("image") || "").toString().trim();
  const excerpt = (formData.get("excerpt") || "").toString().trim();
  const content = (formData.get("content") || "").toString().trim();
  const author = (formData.get("author") || "").toString().trim();
  const publishedAt = (formData.get("publishedAt") || "").toString().trim();
  const published = formData.get("published") === "on";

  if (!title || !content) throw new Error("Judul dan isi artikel wajib diisi");

  const slugFinal =
    slug ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") || `artikel-${Date.now()}`;

  const payload = {
    title,
    slug: slugFinal,
    image: image || null,
    excerpt: excerpt || null,
    content,
    author: author || "Tim Pengelola",
    published,
    published_at: publishedAt || new Date().toISOString().slice(0, 10),
  };

  const supabase = await createAdminClient();
  const { error } = id
    ? await supabase
        .from("articles")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id)
    : await supabase.from("articles").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/articles");
  revalidatePath("/artikel");
}

export async function deleteArticle(formData) {
  await requireAdmin();
  const id = formData.get("id");
  if (!id) throw new Error("Parameter salah");

  const supabase = await createAdminClient();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/articles");
  revalidatePath("/artikel");
}

// ===== Seller accounts =====
// Operasi tulis/hapus lewat fungsi SECURITY DEFINER agar tidak di-block RLS
// (admin panel login pakai cookie, bukan Supabase auth -> is_admin() = false).
async function rpcSetStatus(userId, status) {
  const supabase = await createAdminClient();
  const { error } = await supabase.rpc("admin_set_seller_account_status", {
    p_user_id: userId,
    p_status: status,
  });
  if (error) throw new Error(error.message);
}

export async function approveSellerAccount(formData) {
  await requireAdmin();
  const userId = formData.get("userId");
  if (!userId) throw new Error("Parameter salah");

  const supabase = await createAdminClient();
  const { error } = await supabase.rpc("admin_approve_seller_account", {
    p_user_id: userId,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/accounts");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidateTag("catalog");
}

export async function rejectSellerAccount(formData) {
  await requireAdmin();
  const userId = formData.get("userId");
  if (!userId) throw new Error("Parameter salah");
  await rpcSetStatus(userId, "rejected");
  revalidatePath("/admin/accounts");
}

// ===== Block / unblock seller account =====
export async function setSellerAccountBlocked(formData) {
  await requireAdmin();
  const userId = formData.get("userId");
  const blocked = formData.get("blocked") === "true";
  if (!userId) throw new Error("Parameter salah");
  await rpcSetStatus(userId, blocked ? "blocked" : "approved");
  revalidatePath("/admin/accounts");
  revalidatePath("/seller");
  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidateTag("catalog");
}

// ===== True delete: hapus sampai ke user auth (produk + toko + akun) =====
export async function deleteSellerAccount(formData) {
  await requireAdmin();
  const userId = formData.get("userId");
  if (!userId) throw new Error("Parameter salah");

  const supabase = await createAdminClient();
  const { error } = await supabase.rpc("admin_delete_seller_account", {
    p_user_id: userId,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/accounts");
  revalidatePath("/admin/sellers");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidateTag("catalog");
}

// ===== Join requests =====
export async function approveJoin(formData) {
  await requireAdmin();
  const id = formData.get("id");
  if (!id) throw new Error("Parameter salah");

  const supabase = await createAdminClient();
  const { data: join } = await supabase
    .from("join_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!join) throw new Error("Permintaan tidak ditemukan");
  if (join.status === "approved") {
    revalidatePath("/admin/join");
    return;
  }

  // 1) Buat toko UMKM dari data permintaan.
  const baseName = (join.business_name || "UMKM")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-") || `umkm-${Date.now()}`;
  const slug = `${baseName}-${Date.now().toString(36)}`;
  const { error: sellerErr } = await supabase.from("sellers").insert({
    id: slug,
    name: join.business_name,
    owner: join.owner_name || null,
    whatsapp: join.whatsapp || null,
    address: join.address || null,
    description: join.description || null,
    logo: join.product_image || null,
  });
  if (sellerErr) throw new Error(sellerErr.message);
  const sellerId = slug;

  // 2) Tautkan ke akun penjual (jika pemohon login punya user_id).
  if (join.user_id) {
    const { data: existing } = await supabase
      .from("seller_accounts")
      .select("user_id")
      .eq("user_id", join.user_id)
      .maybeSingle();
    const payload = {
      business_name: join.business_name,
      whatsapp: join.whatsapp || null,
      seller_id: sellerId,
      status: "approved",
    };
    const acctErr = existing
      ? (
          await supabase
            .from("seller_accounts")
            .update(payload)
            .eq("user_id", join.user_id)
        ).error
      : (
          await supabase
            .from("seller_accounts")
            .insert({ user_id: join.user_id, ...payload })
        ).error;
    if (acctErr) throw new Error(acctErr.message);
  }

  // 3) Tandai permintaan disetujui.
  const { error } = await supabase
    .from("join_requests")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/join");
  revalidatePath("/admin/accounts");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/seller");
  revalidateTag("catalog");
}

export async function rejectJoin(formData) {
  await requireAdmin();
  const id = formData.get("id");
  if (!id) throw new Error("Parameter salah");

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("join_requests")
    .update({ status: "rejected", approved_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/join");
}

export async function setJoinStatus(formData) {
  await requireAdmin();
  const id = formData.get("id");
  const status = formData.get("status");
  if (!id || !["pending", "contacted", "approved", "rejected"].includes(status)) {
    throw new Error("Parameter salah");
  }

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("join_requests")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/join");
}

export async function deleteJoin(formData) {
  await requireAdmin();
  const id = formData.get("id");
  if (!id) throw new Error("Parameter salah");

  const supabase = await createAdminClient();
  const { error } = await supabase.from("join_requests").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/join");
}

// ===== Banners =====
export async function saveBanner(formData) {
  await requireAdmin();
  const id = (formData.get("id") || "").toString().trim();
  const imageUrl = (formData.get("imageUrl") || "").toString().trim();
  const title = (formData.get("title") || "").toString().trim();
  const link = (formData.get("link") || "").toString().trim();
  const sortOrder = parseInt(formData.get("sortOrder") || "0", 10) || 0;

  if (!imageUrl) throw new Error("Gambar banner wajib di-upload");

  const payload = {
    image_url: imageUrl,
    title: title || null,
    link: link || null,
    sort_order: sortOrder,
    active: true,
  };

  const supabase = await createAdminClient();
  const { error } = id
    ? await supabase.from("banners").update(payload).eq("id", id)
    : await supabase.from("banners").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/banners");
  revalidatePath("/");
  revalidateTag("banners");
  revalidateTag("catalog");
}

export async function toggleBanner(formData) {
  await requireAdmin();
  const id = formData.get("id");
  const active = formData.get("active") === "true";
  if (!id) throw new Error("Parameter salah");

  const supabase = await createAdminClient();
  const { error } = await supabase.from("banners").update({ active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/banners");
  revalidatePath("/");
  revalidateTag("banners");
  revalidateTag("catalog");
}

export async function deleteBanner(formData) {
  await requireAdmin();
  const id = formData.get("id");
  if (!id) throw new Error("Parameter salah");

  const supabase = await createAdminClient();
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/banners");
  revalidatePath("/");
  revalidateTag("banners");
  revalidateTag("catalog");
}
