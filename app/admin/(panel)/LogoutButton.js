"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/common/Icon";
import { logout } from "@/app/admin/login/actions";

// [LOGOUT KONFIRMASI] Tombol logout merah dengan pop up konfirmasi
// sebelum benar-benar keluar dari panel admin.
export default function LogoutButton() {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const onLogout = async () => {
    setBusy(true);
    try {
      await logout();
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        className="flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold rounded-full bg-red-600 text-white hover:bg-red-700 transition-all"
      >
        <Icon name="logout" size={14} /> Logout
      </button>

      {/* [POP UP KONFIRMASI] Tampil saat tombol Logout ditekan. */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-noir/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl p-5 md:p-6 max-w-sm w-full shadow-card-hover">
            <h3 className="text-base md:text-lg font-bold text-noir mb-1.5">
              Konfirmasi Logout
            </h3>
            <p className="text-xs md:text-sm text-warm-gray leading-relaxed mb-6">
              Apakah Anda yakin ingin logout dari panel admin?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 text-xs md:text-sm font-semibold rounded-full bg-cream text-noir-soft hover:bg-cream-warm transition-all"
              >
                Batal
              </button>
              <button
                onClick={onLogout}
                disabled={busy}
                className="px-4 py-2 text-xs md:text-sm font-semibold rounded-full bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-60"
              >
                {busy ? "Logout..." : "Ya, Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
