"use client";
import Icon from "@/components/common/Icon";
import JoinForm from "@/components/common/JoinForm";

export default function JoinModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl md:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 md:px-6 pt-5 md:pt-6">
          <h3 className="text-base md:text-lg font-bold tracking-tight">
            Gabung sebagai <span className="text-forest">Mitra UMKM</span>
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream-warm text-noir-soft hover:text-forest flex items-center justify-center"
            aria-label="Tutup"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="px-5 md:px-6 pt-1 pb-6">
          <JoinForm />
        </div>
      </div>
    </div>
  );
}
