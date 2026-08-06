"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSellerAccount } from "@/lib/auth";

async function requireApprovedSeller() {
  const account = await getSellerAccount();
  if (!account || account.status !== "approved" || !account.seller_id) {
    throw new Error("Akun penjual belum disetujui");
  }
  return account;
}

const parseList = (v) =>
  (v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export async function registerSellerAccount(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Harus login dulu");

  const businessName = (formData.get("businessName") || "").toString().trim();
  const whatsapp = (formData.get("whatsapp") || "").toString().trim();
  if (!businessName) throw new Error("Nama usaha wajib diisi");

  const { data: existing } = await supabase
    .from("seller_accounts")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const payload = {
    business_name: businessName,
    whatsapp: whatsapp || null,
    status: "pending",
  };
  const { error } = existing
    ? await supabase
        .from("seller_accounts")
        .update(payload)
        .eq("user_id", user.id)
    : await supabase
        .from("seller_accounts")
        .insert({ user_id: user.id, ...payload });
  if (error) throw new Error(error.message);
  revalidatePath("/seller");
  revalidatePath("/gabung");
}

export async function saveSellerLocation(formData) {
  const account = await requireApprovedSeller();
  const lat = formData.get("lat");
  const lng = formData.get("lng");
  const address = (formData.get("address") || "").toString().trim();

  if (lat === "" || lng === "" || lat == null || lng == null) {
    throw new Error("Latitude dan longitude wajib diisi");
  }
  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
    throw new Error("Koordinat tidak valid");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("sellers")
    .update({
      location_lat: latNum,
      location_lng: lngNum,
      address: address || null,
    })
    .eq("id", account.seller_id);
  if (error) throw new Error(error.message);

  revalidatePath("/seller");
  revalidatePath("/");
  revalidatePath("/catalog");
}

export async function saveSellerProduct(formData) {
  const account = await requireApprovedSeller();
  const id = (formData.get("id") || "").toString().trim();
  const name = (formData.get("name") || "").toString().trim();
  const categoryId = (formData.get("categoryId") || "").toString().trim();
  const price = (formData.get("price") || "").toString().trim();
  const priceUnit = (formData.get("priceUnit") || "").toString().trim();
  const description = (formData.get("description") || "").toString().trim();
  const images = parseList(formData.get("images"));
  const tags = parseList(formData.get("tags"));
  const isAvailable = formData.get("isAvailable") === "on";
  const showPrice = formData.get("showPrice") === "on";

  if (!name || !categoryId) throw new Error("Nama dan kategori wajib diisi");
  if (!images.length) throw new Error("Minimal 1 gambar");

  const payload = {
    name,
    category_id: categoryId,
    seller_id: account.seller_id,
    price: price === "" ? null : Number(price),
    price_unit: priceUnit || null,
    description: description || null,
    images,
    tags,
    is_available: isAvailable,
    show_price: showPrice,
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase
        .from("products")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id)
    : await supabase
        .from("products")
        .insert({ id: `prod-${Date.now()}`, ...payload });
  if (error) throw new Error(error.message);

  revalidatePath("/seller/products");
  revalidatePath("/");
  revalidatePath("/catalog");
}

export async function toggleSellerProduct(formData) {
  const account = await requireApprovedSeller();
  const id = formData.get("id");
  const value = formData.get("value") === "true";
  if (!id) throw new Error("Parameter salah");

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_available: value, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("seller_id", account.seller_id);
  if (error) throw new Error(error.message);
  revalidatePath("/seller/products");
  revalidatePath("/");
  revalidatePath("/catalog");
}

export async function deleteSellerProduct(formData) {
  const account = await requireApprovedSeller();
  const id = formData.get("id");
  if (!id) throw new Error("Parameter salah");

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("seller_id", account.seller_id);
  if (error) throw new Error(error.message);
  revalidatePath("/seller/products");
  revalidatePath("/");
  revalidatePath("/catalog");
}
