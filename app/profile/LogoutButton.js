"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Tombol logout untuk halaman /profile. Tombol berwarna merah.
export default function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={logout}
      className="inline-flex items-center justify-center gap-2 px-5 h-11 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-2xl transition-colors"
    >
      Logout
    </button>
  );
}
