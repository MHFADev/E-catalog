"use client";
import { createPortal } from "react-dom";
import Icon from "@/components/common/Icon";
import JoinForm from "@/components/common/JoinForm";

export default function JoinModal({ open, onClose }) {
  if (!open) return null;
  // [POP UP DAFTAR UMKM] Guard ini mencegah error saat SSR, karena createPortal
  // hanya boleh berjalan di sisi klien (document.body belum ada di server).
  if (typeof window === "undefined") return null;

  // [POP UP DAFTAR UMKM] Render modal lewat createPortal ke document.body.
  // Header navbar memakai backdrop-blur-xl yang membuat header menjadi
  // "containing block" untuk elemen fixed di dalamnya, sehingga inset-0 tadi
  // hanya mencakup area header dan pop up tidak di tengah layar. Dengan portal,
  // modal menempel langsung ke body, fixed inset-0 menutup seluruh viewport,
  // dan kartu benar-benar berada di tengah layar (flex items-center justify-center).
  return createPortal(
    <div
      // [POP UP DAFTAR UMKM] modal-fade-in = backdrop memudar masuk
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 modal-fade-in"
      onClick={onClose}
    >
      <div
        // [POP UP DAFTAR UMKM] modal-slide-down = kartu turun dari atas (tidak kaku)
        className="bg-white rounded-2x1 md:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl modal-slide-down"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 md:px-6 pt-5 md:pt-6">
          <h3 className="text-base md:text-lg font-bold tracking-tight mb-4">
            Gabung sebagai <span className="text-forest">Mitra UMKM</span>
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-cream-warm text-noir-soft hover:text-forest flex items-center justify-center mb-4"
            aria-label="Tutup"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="px-5 md:px-6 pt-1 pb-6">
          {/* [POP UP DAFTAR UMKM] onClose diteruskan agar modal bisa ditutup saat pindah halaman */}
          <JoinForm onClose={onClose} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
