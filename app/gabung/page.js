"use client";
import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import { generateWhatsAppLink } from "@/lib/generateWhatsAppLink";
import { ADMIN_WHATSAPP } from "@/lib/constants";

const inputClass =
  "w-full bg-cotton-pure border border-cotton-warm rounded-xl px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-cherry/50 focus:ring-2 focus:ring-cherry/10 transition-all";

export default function GabungPage() {
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    whatsapp: "",
    productType: "",
    notes: "",
  });
  const [status, setStatus] = useState("");

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
    } catch {
      setStatus("error");
    }
    setForm({
      businessName: "",
      ownerName: "",
      whatsapp: "",
      productType: "",
      notes: "",
    });
    setTimeout(() => setStatus(""), 6000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 md:px-6 py-10 md:py-16">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cherry/10 text-cherry font-mono text-[10px] md:text-xs uppercase tracking-wider rounded-full font-semibold mb-3">
          <Icon name="store" size={12} /> UMKM Kemayoran
        </span>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tighter mb-2">
          Gabung <span className="text-cherry">Katalog</span>
        </h1>
        <p className="text-sm md:text-base text-warm-gray leading-relaxed">
          Daftarkan usaha UMKM Anda dan tampil di katalog digital ini. Admin akan
          menghubungi Anda via WhatsApp.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm border border-cotton-warm space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-noir mb-1.5">
            Nama Usaha <span className="text-cherry">*</span>
          </label>
          <input
            type="text"
            value={form.businessName}
            onChange={set("businessName")}
            placeholder="cth. Aneka Cemilan 39"
            required
            className={inputClass}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-noir mb-1.5">
              Nama Pemilik
            </label>
            <input
              type="text"
              value={form.ownerName}
              onChange={set("ownerName")}
              placeholder="cth. Ibu Siti"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-noir mb-1.5">
              No. WhatsApp <span className="text-cherry">*</span>
            </label>
            <input
              type="tel"
              value={form.whatsapp}
              onChange={set("whatsapp")}
              placeholder="cth. 628xxxxxxxxxx"
              required
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-noir mb-1.5">
            Jenis Produk
          </label>
          <input
            type="text"
            value={form.productType}
            onChange={set("productType")}
            placeholder="cth. Camilan tradisional, kerajinan tangan, sembako"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-noir mb-1.5">
            Catatan Tambahan
          </label>
          <textarea
            value={form.notes}
            onChange={set("notes")}
            rows={3}
            placeholder="Ceritakan usaha Anda..."
            className={`${inputClass} resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="btn-primary w-full text-sm md:text-base py-3 disabled:opacity-60"
        >
          {status === "sending" ? "Mengirim..." : "Daftarkan Usaha"}
        </button>

        {status === "sent" && (
          <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            Permintaan terkirim! Admin akan menghubungi Anda segera.
          </p>
        )}
        {status === "error" && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Gagal mengirim. Hubungi kami via WhatsApp sebagai alternatif.
          </p>
        )}

        <div className="pt-2 border-t border-cotton-warm text-center">
          <a
            href={generateWhatsAppLink(
              ADMIN_WHATSAPP,
              "Halo, saya ingin bergabung sebagai mitra UMKM di E-Catalog Kemayoran. Mohon informasinya.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-cherry hover:underline"
          >
            <Icon name="whatsapp" size={14} /> Lebih suka chat WhatsApp?
          </a>
        </div>
      </form>

      <div className="text-center mt-6">
        <Link
          href="/"
          className="text-xs md:text-sm text-warm-gray hover:text-cherry"
        >
          ← Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
