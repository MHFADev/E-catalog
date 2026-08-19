import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSellerAccount } from "@/lib/auth";
import { isAutoUsername } from "@/lib/username";
import ProfileForm from "./ProfileForm";

const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;

export const metadata = { title: "Profil Saya" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, username_updated_at, created_at, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const sellerAccount = await getSellerAccount();
  const approvedSeller =
    sellerAccount?.status === "approved" && Boolean(sellerAccount?.seller_id);

  let seller = null;
  let sellerLogo = null;
  if (approvedSeller && sellerAccount.seller_id) {
    const { data } = await supabase
      .from("sellers")
      .select("id, name, whatsapp, description, logo, bank_name, bank_account_number, bank_account_name, ewallet_type, ewallet_number, qris_image_url, enabled_payment_methods")
      .eq("id", sellerAccount.seller_id)
      .maybeSingle();
    seller = data;
    sellerLogo = data?.logo || null;
  }

  const lastChange = profile?.username_updated_at
    ? new Date(profile.username_updated_at).getTime()
    : null;
  const notRenamedYet = isAutoUsername(profile?.username);
  const canRename =
    notRenamedYet || !lastChange || Date.now() - lastChange >= TWO_YEARS_MS;

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Pengguna";

  return (
    <ProfileForm
      user={{ id: user.id, email: user.email, fullName }}
      profile={profile}
      canRename={canRename}
      approvedSeller={approvedSeller}
      sellerLogo={sellerLogo}
      seller={seller}
    />
  );
}