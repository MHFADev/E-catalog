"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SellerLogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/seller/login");
    router.refresh();
  };

  return (
    <button
      onClick={logout}
      className="px-4 py-2 text-xs md:text-sm font-semibold rounded-full bg-noir text-cream-pure hover:bg-forest transition-all"
    >
      Keluar
    </button>
  );
}
