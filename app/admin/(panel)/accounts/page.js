import { createAdminClient } from "@/lib/supabase/admin";
import AccountsManager from "@/components/admin/AccountsManager";

export default async function AdminAccountsPage() {
  let accounts = [];
  let errorMsg = null;
  const supabase = await createAdminClient();
  try {
    const { data, error } = await supabase
      .from("seller_accounts")
      .select("*, sellers(name, whatsapp, address, logo)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    accounts = data || [];
  } catch (err) {
    errorMsg = err?.message || "Gagal membaca akun penjual.";
  }

  const missingKey = /SERVICE_ROLE_KEY|belum diset/i.test(errorMsg || "");

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

      {errorMsg ? (
        <div className="mb-4 text-xs bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 leading-relaxed text-amber-800">
          {missingKey ? (
            <>
              <strong>Panel admin belum dapat mengakses database.</strong> Setel{" "}
              <span className="font-mono">SUPABASE_SERVICE_ROLE_KEY</span> di
              Vercel & di <span className="font-mono">.env.local</span>, lalu
              redeploy.
            </>
          ) : (
            <>
              <strong>Gagal membaca data.</strong> {errorMsg}
            </>
          )}
        </div>
      ) : null}

      <AccountsManager accounts={accounts} />
    </div>
  );
}