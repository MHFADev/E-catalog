import { createAdminClient } from "@/lib/supabase/admin";
import AccountsManager from "@/components/admin/AccountsManager";

export default async function AdminAccountsPage() {
  const supabase = await createAdminClient();
  const { data: accounts } = await supabase
    .from("seller_accounts")
    .select("*, sellers(name, whatsapp, address, logo)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h2 className="text-sm md:text-base font-bold text-noir mb-4">
        Akun Penjual / Pemilik UMKM ({accounts?.length ?? 0})
      </h2>
      <p className="text-xs text-warm-gray mb-4 leading-relaxed">
        Semua akun yang terdaftar sebagai penjual UMKM beserta tokonya. Kelola
        status (setujui / tolak / blokir) atau hapus seluruh data UMKM dari
        kartu masing-masing.
      </p>

      <AccountsManager accounts={accounts ?? []} />
    </div>
  );
}