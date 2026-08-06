import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSellerAccount } from "@/lib/auth";
import SettingsForm from "./SettingsForm";

export const metadata = { title: "Pengaturan" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings");

  const account = await getSellerAccount();
  let seller = null;
  if (account?.status === "approved" && account.seller_id) {
    const { data } = await supabase
      .from("sellers")
      .select("id, name, whatsapp, description")
      .eq("id", account.seller_id)
      .maybeSingle();
    seller = data;
  }

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Pengguna";

  return (
    <SettingsForm
      user={{ id: user.id, email: user.email, fullName }}
      seller={seller}
    />
  );
}