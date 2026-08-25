"use server";

import { createHash } from "crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { normalizePhoneIdentifier, phoneAliasEmail } from "@/lib/authIdentifier";
import { uploadExternalImage } from "@/lib/github";

const INITIAL_PASSWORD = "UMKM-kemayoran12";

function text(value, max = 500) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, max);
}

function stableId(prefix, value) {
  return `${prefix}-${createHash("sha1").update(value).digest("hex").slice(0, 16)}`;
}

function parsePrice(value) {
  const source = text(value, 100).toLowerCase();
  if (!source || /beda|hubungi|^-+$/.test(source)) return null;
  const shorthand = source.match(/(\d+(?:[.,]\d+)?)\s*k\b/);
  if (shorthand) {
    const number = Number(shorthand[1].replace(",", ".")) * 1000;
    return Number.isFinite(number) && number > 0 ? Math.round(number) : null;
  }
  const compact = source.replace(/\./g, "").replace(/,/g, ".");
  const match = compact.match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  const number = Number(match[0]);
  return Number.isFinite(number) && number > 0 ? Math.round(number) : null;
}

function resolveCategoryId(categories, productType) {
  const type = text(productType, 120).toLowerCase();
  const names = categories.map((category) => ({ ...category, normalized: text(category.name, 120).toLowerCase() }));
  const hints = type.includes("kuliner")
    ? ["makanan", "kuliner", "minuman"]
    : type.includes("jasa")
      ? ["jasa", "layanan"]
      : type.includes("kerajinan") || type.includes("kreatif")
        ? ["kerajinan", "kreatif", "lainnya"]
        : ["lainnya", "umum"];
  return names.find((category) => hints.some((hint) => category.normalized.includes(hint)))?.id || categories[0]?.id || null;
}

function normalizeManifest(value) {
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  const stores = Array.isArray(parsed?.stores) ? parsed.stores : [];
  if (!stores.length) throw new Error("Manifest tidak memiliki data UMKM.");
  if (stores.length > 100) throw new Error("Manifest impor melebihi batas 100 UMKM.");
  return stores.map((store, index) => ({
    importKey: text(store.importKey || `${store.businessName}-${index}`, 180),
    businessName: text(store.businessName, 140),
    ownerName: text(store.ownerName, 120),
    whatsapp: text(store.whatsapp, 40),
    productType: text(store.productType, 140),
    description: text(store.description, 1000),
    products: Array.isArray(store.products)
      ? store.products
          .map((product, productIndex) => ({
            importKey: text(product.importKey || `${store.businessName}-${product.name}-${productIndex}`, 220),
            name: text(product.name, 160),
            description: text(product.description, 1200),
            rawPrice: text(product.rawPrice, 120),
            sourceImages: Array.isArray(product.sourceImages) ? product.sourceImages.map((url) => text(url, 1000)).filter(Boolean) : [],
          }))
          .filter((product) => product.name && product.name !== "-")
      : [],
  })).filter((store) => store.businessName);
}

function driveDownloadUrl(sourceUrl) {
  try {
    const url = new URL(sourceUrl);
    const id = url.searchParams.get("id") || url.pathname.match(/\/d\/([^/]+)/)?.[1];
    return id ? `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}` : null;
  } catch {
    return null;
  }
}

function imageName(productName, sourceUrl, position) {
  const suffix = createHash("sha1").update(sourceUrl).digest("hex").slice(0, 10);
  return `${text(productName, 48)}-${position + 1}-${suffix}`;
}

export async function importUmkmManifest(manifestText) {
  if (!(await isAdmin())) throw new Error("Akses impor hanya untuk admin.");

  const stores = normalizeManifest(manifestText);
  const admin = await createAdminClient();
  const { data: categories, error: categoriesError } = await admin.from("categories").select("id, name").order("name");
  if (categoriesError || !categories?.length) throw new Error("Kategori katalog belum tersedia.");

  const { data: userPage, error: usersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (usersError) throw new Error("Daftar akun belum dapat dibaca.");
  const usersByEmail = new Map((userPage?.users || []).map((user) => [String(user.email || "").toLowerCase(), user]));

  const contactGroups = new Map();
  const invalidContacts = [];
  for (const store of stores) {
    const phone = normalizePhoneIdentifier(store.whatsapp);
    if (!phone) {
      invalidContacts.push(store.businessName);
      continue;
    }
    if (!contactGroups.has(phone)) contactGroups.set(phone, []);
    contactGroups.get(phone).push(store);
  }

  const accountsByPhone = new Map();
  const accountResults = { created: 0, existing: 0 };
  for (const [phone, group] of contactGroups) {
    const aliasEmail = phoneAliasEmail(phone);
    let user = usersByEmail.get(aliasEmail.toLowerCase());
    if (!user) {
      const { data, error } = await admin.auth.admin.createUser({
        email: aliasEmail,
        password: INITIAL_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: group[0].ownerName || group[0].businessName,
          phone_number: phone,
          login_identifier: "phone",
          imported_from: "umkm-spreadsheet",
        },
      });
      if (error || !data.user) throw new Error(`Akun untuk ${group[0].businessName} belum dapat dibuat.`);
      user = data.user;
      accountResults.created += 1;
    } else {
      accountResults.existing += 1;
    }
    accountsByPhone.set(phone, user);
    const { error: profileError } = await admin.from("profiles").upsert({ id: user.id, phone_number: phone }, { onConflict: "id" });
    if (profileError) throw new Error(`Profil untuk ${group[0].businessName} belum dapat disiapkan.`);
  }

  let storesImported = 0;
  let productsImported = 0;
  const imageQueue = [];
  const primaryStoreWritten = new Set();

  for (const store of stores) {
    const sellerId = stableId("umkm", store.importKey || store.businessName);
    const phone = normalizePhoneIdentifier(store.whatsapp);
    const user = phone ? accountsByPhone.get(phone) : null;
    const sellerPayload = {
      id: sellerId,
      name: store.businessName,
      owner: store.ownerName || null,
      whatsapp: phone || store.whatsapp || null,
      description: store.description || store.productType || null,
    };
    const { error: sellerError } = await admin.from("sellers").upsert(sellerPayload, { onConflict: "id" });
    if (sellerError) throw new Error(`Toko ${store.businessName} belum dapat disimpan.`);
    storesImported += 1;

    if (user && phone) {
      const isPrimary = !primaryStoreWritten.has(phone);
      if (isPrimary) {
        const { error: accountError } = await admin.from("seller_accounts").upsert({
          user_id: user.id,
          business_name: store.businessName,
          whatsapp: phone,
          seller_id: sellerId,
          status: "approved",
        }, { onConflict: "user_id" });
        if (accountError) throw new Error(`Akses akun ${store.businessName} belum dapat disiapkan.`);
        primaryStoreWritten.add(phone);
      }
      const { error: accessError } = await admin.from("seller_store_access").upsert({
        user_id: user.id,
        seller_id: sellerId,
        status: "approved",
        is_primary: isPrimary,
      }, { onConflict: "user_id,seller_id" });
      if (accessError) throw new Error(`Akses toko ${store.businessName} belum dapat disiapkan.`);
    }

    const categoryId = resolveCategoryId(categories, store.productType);
    for (const product of store.products) {
      const price = parsePrice(product.rawPrice);
      const productId = stableId("prod-umkm", product.importKey || `${sellerId}-${product.name}`);
      const description = [product.description, product.rawPrice && !price ? `Harga dari formulir: ${product.rawPrice}` : ""].filter(Boolean).join("\n\n");
      const { error: productError } = await admin.from("products").upsert({
        id: productId,
        seller_id: sellerId,
        category_id: categoryId,
        name: product.name,
        description: description || null,
        price,
        price_unit: price ? "per item" : null,
        show_price: Boolean(price),
        is_available: true,
        images: [],
        tags: [store.productType].filter(Boolean),
      }, { onConflict: "id" });
      if (productError) throw new Error(`Produk ${product.name} belum dapat disimpan.`);
      productsImported += 1;
      imageQueue.push({ productId, sellerId, productName: product.name, sourceImages: product.sourceImages });
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/sellers");
  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  revalidateTag("catalog");

  return {
    accounts: accountResults,
    storesImported,
    productsImported,
    imagesQueued: imageQueue.reduce((total, item) => total + item.sourceImages.length, 0),
    invalidContacts,
    imageQueue,
  };
}

export async function importUmkmImageBatch(items) {
  if (!(await isAdmin())) throw new Error("Akses impor hanya untuk admin.");
  if (!Array.isArray(items) || !items.length) throw new Error("Tidak ada foto yang perlu diproses.");
  if (items.length > 3) throw new Error("Maksimal tiga produk per batch foto.");

  const admin = await createAdminClient();
  const imported = [];
  const failures = [];

  for (const item of items) {
    const productId = text(item?.productId, 120);
    const productName = text(item?.productName, 160);
    const sourceImages = Array.isArray(item?.sourceImages) ? item.sourceImages.map((url) => text(url, 1000)).filter(Boolean).slice(0, 5) : [];
    if (!productId || !sourceImages.length) continue;

    const { data: product, error: productError } = await admin.from("products").select("id, images").eq("id", productId).maybeSingle();
    if (productError || !product) {
      failures.push({ productId, reason: "Produk tidak ditemukan." });
      continue;
    }

    const urls = [];
    for (const [index, sourceUrl] of sourceImages.entries()) {
      const downloadUrl = driveDownloadUrl(sourceUrl);
      if (!downloadUrl) {
        failures.push({ productId, sourceUrl, reason: "Tautan Drive tidak valid." });
        continue;
      }
      try {
        const response = await fetch(downloadUrl, { cache: "no-store", redirect: "follow" });
        const contentType = response.headers.get("content-type") || "";
        if (!response.ok || !contentType.startsWith("image/")) throw new Error("Foto tidak dapat diunduh dari Drive.");
        const bytes = Buffer.from(await response.arrayBuffer());
        if (!bytes.length || bytes.length > 4_000_000) throw new Error("Ukuran foto tidak didukung.");
        const { url } = await uploadExternalImage({
          base64: bytes.toString("base64"),
          name: imageName(productName || productId, sourceUrl, index),
          contentType,
          folder: `umkm-import/${productId}`,
        });
        urls.push(url);
      } catch (error) {
        failures.push({ productId, sourceUrl, reason: error instanceof Error ? error.message : "Foto belum dapat diproses." });
      }
    }

    if (urls.length) {
      const current = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
      const nextImages = [...new Set([...current, ...urls])];
      const { error: updateError } = await admin.from("products").update({ images: nextImages, updated_at: new Date().toISOString() }).eq("id", productId);
      if (updateError) {
        failures.push({ productId, reason: "URL foto belum dapat disimpan." });
        continue;
      }
      await admin.from("product_images").delete().eq("product_id", productId);
      const { error: imagesError } = await admin.from("product_images").insert(nextImages.map((imageUrl, sortOrder) => ({ product_id: productId, image_url: imageUrl, sort_order: sortOrder })));
      if (imagesError) failures.push({ productId, reason: "Urutan foto belum dapat disimpan." });
      else imported.push({ productId, count: urls.length });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  revalidateTag("catalog");
  return { imported, failures };
}
