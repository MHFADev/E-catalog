import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isAdmin as envAdmin } from "@/lib/admin";

const ACTIVE_SELLER_COOKIE = "umkm_active_seller";

export async function isAdmin() {
  return envAdmin();
}

export async function getSellerAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: account }, { data: storeAccess }] = await Promise.all([
    supabase
      .from("seller_accounts")
      .select("*, sellers(name)")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("seller_store_access")
      .select("seller_id, status, is_primary, sellers(name)")
      .eq("user_id", user.id)
      .eq("status", "approved"),
  ]);

  const accessibleStores = (storeAccess || [])
    .filter((store) => store.seller_id)
    .map((store) => ({
      id: store.seller_id,
      name: store.sellers?.name || store.seller_id,
      isPrimary: Boolean(store.is_primary),
    }));

  if (account?.seller_id && account.status === "approved" && !accessibleStores.some((store) => store.id === account.seller_id)) {
    accessibleStores.unshift({
      id: account.seller_id,
      name: account.sellers?.name || account.business_name || account.seller_id,
      isPrimary: true,
    });
  }

  if (!account) return null;
  if (!accessibleStores.length) return { ...account, accessible_stores: [] };

  const cookieStore = await cookies();
  const activeSellerId = cookieStore.get(ACTIVE_SELLER_COOKIE)?.value;
  const selectedStore =
    accessibleStores.find((store) => store.id === activeSellerId) ||
    accessibleStores.find((store) => store.isPrimary) ||
    accessibleStores[0];

  return {
    ...account,
    seller_id: selectedStore.id,
    sellers: { name: selectedStore.name },
    status: "approved",
    accessible_stores: accessibleStores,
  };
}

export async function isSellerOrAdmin() {
  if (await isAdmin()) return true;
  const account = await getSellerAccount();
  return Boolean(account?.status === "approved" && account.seller_id);
}

export { ACTIVE_SELLER_COOKIE };
