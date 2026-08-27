import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSellerAccount } from "@/lib/auth";
import PendingProfile from "../PendingProfile";
import StoreSwitcher from "./StoreSwitcher";

export default async function SellerLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/seller/login");

  const account = await getSellerAccount();
  const approved = account?.status === "approved" && account.seller_id;

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Area <span className="text-forest">Penjual</span>
            </h1>
            <p className="text-xs md:text-sm text-warm-gray">
              {approved
                ? (account.sellers?.name ?? account.business_name)
                : "Akun Anda"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {approved && (
              <StoreSwitcher
                stores={account.accessible_stores}
                activeSellerId={account.seller_id}
              />
            )}
            <Link
              href="/"
              className="text-xs md:text-sm text-warm-gray hover:text-forest px-3 py-2"
            >
              Lihat Situs
            </Link>
          </div>
        </div>

        {!approved ? (
          account?.status === "blocked" ? (
            <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 border border-cream-warm text-center max-w-lg mx-auto">
              <div className="text-2xl mb-2">🚫</div>
              <h2 className="text-base md:text-lg font-bold text-noir mb-1">
                Akun Diblokir
              </h2>
              <p className="text-xs md:text-sm text-warm-gray leading-relaxed">
                Akun penjual Anda sedang diblokir oleh admin. Anda tidak dapat
                mengelola toko untuk sementara. Hubungi admin untuk informasi
                lebih lanjut.
              </p>
            </div>
          ) : account?.status === "pending" || account?.status === "rejected" ? (
            <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 border border-cream-warm text-center max-w-lg mx-auto">
              <div className="text-2xl mb-2">✅</div>
              <h2 className="text-base md:text-lg font-bold text-noir mb-1">
                Menunggu Persetujuan Admin
              </h2>
              <p className="text-xs md:text-sm text-warm-gray leading-relaxed">
                {account.status === "rejected"
                  ? "Profil Anda ditolak. Hubungi admin untuk info lebih lanjut."
                  : "Profil usaha Anda sedang ditinjau admin. Anda akan bisa mengelola produk setelah disetujui."}
              </p>
            </div>
          ) : (
            <PendingProfile />
          )
        ) : (
          <>
            <nav className="flex gap-2 overflow-x-auto pb-2 mb-6">
              <Link
                href="/seller"
                className="shrink-0 px-4 py-2 text-xs md:text-sm font-semibold rounded-full bg-white border border-cream-warm text-noir-soft hover:border-forest hover:text-forest transition-all"
              >
                Dashboard
              </Link>
              <Link
                href="/seller/orders"
                className="shrink-0 px-4 py-2 text-xs md:text-sm font-semibold rounded-full bg-white border border-cream-warm text-noir-soft hover:border-forest hover:text-forest transition-all"
              >
                Pesanan
              </Link>
              <Link
                href="/seller/products"
                className="shrink-0 px-4 py-2 text-xs md:text-sm font-semibold rounded-full bg-white border border-cream-warm text-noir-soft hover:border-forest hover:text-forest transition-all"
              >
                Produk Saya
              </Link>
              <Link
                href="/seller/payment"
                className="shrink-0 px-4 py-2 text-xs md:text-sm font-semibold rounded-full bg-white border border-cream-warm text-noir-soft hover:border-forest hover:text-forest transition-all"
              >
                Pembayaran
              </Link>
            </nav>
            {children}
          </>
        )}
      </div>
    </div>
  );
}
