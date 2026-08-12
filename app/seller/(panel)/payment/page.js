import { getSellerAccount } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import PaymentSettingsManager from "@/components/seller/PaymentSettingsManager";

export const dynamic = "force-dynamic";

export default async function SellerPaymentPage() {
  const account = await getSellerAccount();
  const supabase = await createClient();

  const { data: methods } = await supabase
    .from("payment_methods")
    .select(
      "id, method_type, provider, label, account_number, account_name, qris_image_url, is_active, sort_order",
    )
    .eq("seller_id", account.seller_id)
    .order("sort_order", { ascending: true });

  return (
    <div>
      <h2 className="text-sm md:text-base font-bold text-noir mb-4">
        Metode Pembayaran Toko
      </h2>
      <PaymentSettingsManager sellerId={account.seller_id} methods={methods || []} />
    </div>
  );
}
