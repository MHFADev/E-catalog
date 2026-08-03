"use client";
import { useRouter } from "next/navigation";
import { logout } from "@/app/admin/login/actions";

export default function LogoutButton() {
  const router = useRouter();

  const onLogout = async () => {
    await logout();
    router.refresh();
  };

  return (
    <button
      onClick={onLogout}
      className="px-4 py-2 text-xs md:text-sm font-semibold rounded-full bg-noir text-cream-pure hover:bg-forest transition-all"
    >
      Keluar
    </button>
  );
}
