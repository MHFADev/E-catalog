import { notFound } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { getProducts, getSellers } from "@/lib/catalog";
import { getSellerPaymentMethods } from "@/lib/paymentMethods";
import { getCurrentProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ params }) {
  const { id } = await params;
  const [products, sellers] = await Promise.all([getProducts(), getSellers()]);
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  const seller = sellers.find((s) => s.id === product.sellerId);
  const methods = await getSellerPaymentMethods(seller?.id);

  const [profile, { data: { user } }] = await Promise.all([
    getCurrentProfile(),
    (async () => {
      const supabase = await createClient();
      return supabase.auth.getUser();
    })(),
  ]);

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "";

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <Link
          href={`/product/${product.id}`}
          className="inline-flex items-center gap-1 text-xs md:text-sm text-warm-gray hover:text-forest mb-4"
        >
          <Icon name="arrowLeft" size={14} /> Kembali ke produk
        </Link>

        <h1 className="text-lg md:text-2xl font-bold tracking-tight text-noir mb-4 md:mb-6">
          Checkout — <span className="text-forest">Buat Pesanan</span>
        </h1>

        {product.isAvailable === false ? (
          <div className="bg-white rounded-2xl p-6 border border-cream-warm text-center text-sm text-warm-gray">
            Produk ini sedang tidak tersedia.{" "}
            <Link href={`/product/${product.id}`} className="text-forest font-semibold">
              Kembali
            </Link>
          </div>
        ) : !user ? (
          <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 border border-cream-warm text-center max-w-lg mx-auto">
            <Icon name="lock" size={22} className="text-forest mx-auto mb-2" />
            <p className="text-sm font-semibold text-noir mb-1">
              Login untuk Checkout
            </p>
            <p className="text-xs text-warm-gray mb-4">
              Anda perlu masuk agar bisa upload bukti transfer dan melacak
              pesanan Anda.
            </p>
            <Link
              href={`/login?next=${encodeURIComponent(`/product/${product.id}/checkout`)}`}
              className="btn-primary text-sm py-2.5 px-6"
            >
              Masuk / Daftar
            </Link>
          </div>
        ) : (
          <CheckoutForm
            product={product}
            seller={seller}
            paymentMethods={methods}
            userId={user.id}
            defaultBuyerName={profile?.username || fullName}
            defaultBuyerPhone={profile?.phone_number || ""}
          />
        )}
      </div>
    </div>
  );
}
