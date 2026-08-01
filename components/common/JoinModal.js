"use client";
import { useState } from "react";
import Icon from "@/components/common/Icon";
import { generateWhatsAppLink } from "@/lib/generateWhatsAppLink";
import { ADMIN_WHATSAPP } from "@/lib/constants";

const inputClass =
  "w-full bg-cotton-pure border border-cotton-warm rounded-xl px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-cherry/50 focus:ring-2 focus:ring-cherry/10 transition-all";

const WA_TEMPLATE = (d) =>
  [
    "Halo *Admin E-Catalog UMKM Kemayoran* 👋",
    "",
    "Saya ingin bergabung sebagai *mitra UMKM* 🏪",
    "",
    "📋 *Data Pendaftaran:*",
    `• Nama Usaha: ${d.businessName}`,
    d.ownerName ? `• Pemilik: ${d.ownerName}` : null,
    `• WhatsApp: ${d.whatsapp}`,
    d.productType ? `• Jenis Produk: ${d.productType}` : null,
    d.notes ? `• Catatan: ${d.notes}` : null,
    "",
    "Mohon diverifikasi ya 🙏 Terima kasih!",
  ]
    .filter(Boolean)
    .join("\n");

export default function JoinModal({ open, onClose }) {
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    whatsapp: "",
    productType: "",
    notes: "",
  });
  const [status, setStatus] = useState("");

  if (!open) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.businessName.trim() || !form.whatsapp.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("gagal");
      setStatus("sent");
      // Buka WhatsApp admin dengan pesan siap kirim + emoji
      window.open(
        generateWhatsAppLink(ADMIN_WHATSAPP, WA_TEMPLATE(form)),
        "_blank",
      );
      setTimeout(() => {
        setStatus("");
        onClose();
        setForm({ businessName: "", ownerName: "", whatsapp: "", productType: "", notes: "" });
      }, 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus(""), 4000);
    }
  };

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
            Gabung sebagai <span className="text-cherry">Mitra UMKM</span>
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cotton-warm text-noir-soft hover:text-cherry flex items-center justify-center"
            aria-label="Tutup"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        <p className="text-xs text-warm-gray px-5 md:px-6 mt-1 mb-4 leading-relaxed">
          Isi data usaha Anda. Permintaan masuk ke admin, dan Anda bisa langsung
          verifikasi lewat WhatsApp. 🏪
        </p>

        <form onSubmit={submit} className="px-5 md:px-6 pb-6 space-y-3">
          <input
            type="text"
            value={form.businessName}
            onChange={set("businessName")}
            placeholder="Nama usaha *"
            required
            className={inputClass}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={form.ownerName}
              onChange={set("ownerName")}
              placeholder="Pemilik"
              className={inputClass}
            />
            <input
              type="tel"
              value={form.whatsapp}
              onChange={set("whatsapp")}
              placeholder="No. WhatsApp *"
              required
              className={inputClass}
            />
          </div>
          <input
            type="text"
            value={form.productType}
            onChange={set("productType")}
            placeholder="Jenis produk (cth. camilan, kerajinan)"
            className={inputClass}
          />
          <textarea
            value={form.notes}
            onChange={set("notes")}
            rows={2}
            placeholder="Catatan tambahan"
            className={`${inputClass} resize-none`}
          />

          <button
            type="submit"
            disabled={status === "sending"}
            className="btn-primary w-full text-sm py-3 disabled:opacity-60"
          >
            {status === "sending" ? "Mengirim..." : "Kirim & Verifikasi via WhatsApp"}
          </button>

          {status === "sent" && (
            <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              Terkirim! Pesan WhatsApp dibuka untuk verifikasi. ✅
            </p>
          )}
          {status === "error" && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Gagal menyimpan permintaan. WhatsApp tetap bisa dikirim — hubungi
              kami langsung.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
