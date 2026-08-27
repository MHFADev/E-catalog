import { getSellerAccount } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import PaymentSettingsManager from "@/components/seller/PaymentSettingsManager";
import Icon from "@/components/common/Icon";

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
    <div className="space-y-5">
      <header className="rounded-2xl border border-forest/15 bg-gradient-to-br from-forest/10 via-white to-cream p-5 md:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest text-white shadow-sm">
            <Icon name="money" size={19} />
          </span>
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-forest">Area Penjual</p>
            <h2 className="mt-1 text-base font-bold tracking-tight text-noir md:text-lg">Metode Pembayaran Toko</h2>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-warm-gray md:text-sm">
              Tambahkan beberapa rekening bank, e-wallet, dan QRIS. Hanya metode aktif yang akan tampil kepada pembeli.
            </p>
          </div>
        </div>
      </header>
      <PaymentSettingsManager sellerId={account.seller_id} methods={methods || []} />
    </div>
  );
}
