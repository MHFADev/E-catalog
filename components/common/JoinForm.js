"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import ImageUploader from "@/components/common/ImageUploader";
import PhoneInput from "@/components/common/PhoneInput";
import { submitJoinRequest } from "@/app/join/actions";
import { useUser } from "@/lib/useUser";

const inputClass =
  "w-full rounded-xl border border-cream-warm bg-cream-pure px-3 py-2.5 text-sm text-noir placeholder:text-muted transition-all focus:border-forest/50 focus:outline-none focus:ring-2 focus:ring-forest/10";

const businessTypes = [
  "Kuliner & Minuman",
  "Fashion & Aksesori",
  "Kriya & Produk Kreatif",
  "Kecantikan & Kesehatan",
  "Sembako & Kebutuhan Rumah",
  "Jasa",
  "Lainnya",
];

function FieldLabel({ children, optional = false, hint }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold text-noir-soft">
      {children} {optional ? <span className="font-normal text-warm-gray">(opsional)</span> : <span className="text-forest">*</span>}
      {hint && <span className="mt-0.5 block text-[10px] font-normal leading-relaxed text-warm-gray">{hint}</span>}
    </label>
  );
}

function FormSection({ number, icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-cream-warm bg-white p-4 md:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest/10 font-mono text-[11px] font-bold text-forest">
          {number}
        </span>
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-noir">
            <Icon name={icon} size={15} className="text-forest" />
            {title}
          </h3>
          <p className="mt-0.5 text-[11px] leading-relaxed text-warm-gray">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function JoinForm({ onClose }) {
  const { user, loading } = useUser();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-sm text-warm-gray">
        <span className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-cream-warm border-t-forest" />
        Memuat formulir...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-6 text-center md:py-8">
        <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-laut/10 text-laut">
          <Icon name="lock" size={24} />
        </span>
        <h3 className="mb-2 text-base font-bold text-noir md:text-lg">Login Dulu untuk Mendaftar</h3>
        <p className="mx-auto mb-5 max-w-sm text-xs leading-relaxed text-warm-gray md:text-sm">
          Pendaftaran terhubung ke akun Anda agar admin dapat menyetujui usaha dan Anda bisa langsung mengelola toko setelahnya.
        </p>
        <Link href="/login?next=/gabung" onClick={onClose} className="btn-primary text-sm md:text-base">
          Masuk / Daftar Akun <Icon name="arrowRight" size={14} />
        </Link>
      </div>
    );
  }

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("sending");

    try {
      const result = await submitJoinRequest(new FormData(event.currentTarget));
      if (result?.ok) setStatus("sent");
    } catch (submitError) {
      setError(submitError.message || "Pengajuan belum dapat dikirim.");
      setStatus("");
    }
  };

  if (status === "sent") {
    return (
      <div className="py-6 text-center md:py-8">
        <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Icon name="check" size={24} />
        </span>
        <h3 className="mb-2 text-base font-bold text-noir md:text-lg">Pengajuan Terkirim</h3>
        <p className="mx-auto mb-5 max-w-md text-xs leading-relaxed text-warm-gray md:text-sm">
          Terima kasih. Admin akan meninjau data usaha Anda. Setelah disetujui, akun ini dapat digunakan untuk mengelola toko dan produk di{" "}
          <Link href="/seller" className="font-semibold text-forest hover:underline">
            Area Penjual
          </Link>
          .
        </p>
        <Link href="/" className="btn-secondary text-sm">Kembali ke Beranda</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-2xl border border-forest/15 bg-forest/5 p-3.5 md:p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-forest shadow-sm">
            <Icon name="badgeCheck" size={18} />
          </span>
          <div>
            <p className="text-xs font-bold text-noir">Lengkapi profil usaha dalam sekitar 3 menit</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-warm-gray">
              Kami hanya meminta informasi yang membantu admin memahami usaha Anda. Tidak ada permintaan NIK, NIP, rekening, atau dokumen sensitif pada tahap ini.
            </p>
          </div>
        </div>
      </div>

      <FormSection
        number="01"
        icon="store"
        title="Identitas Usaha"
        description="Ceritakan usaha yang ingin Anda tampilkan di katalog."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel>Nama usaha / toko</FieldLabel>
            <input name="businessName" type="text" placeholder="Contoh: Dapur Bu Rina" required minLength={2} maxLength={100} className={inputClass} />
          </div>
          <div>
            <FieldLabel>Bidang usaha</FieldLabel>
            <select name="businessType" required defaultValue="" className={inputClass}>
              <option value="" disabled>Pilih bidang usaha</option>
              {businessTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <FieldLabel hint="Tuliskan produk atau layanan yang paling sering Anda tawarkan.">Produk / layanan utama</FieldLabel>
            <input name="categoryProduct" type="text" placeholder="Contoh: nasi box rumahan, kue kering, atau hampers" required minLength={3} maxLength={160} className={inputClass} />
          </div>
        </div>
      </FormSection>

      <FormSection
        number="02"
        icon="user"
        title="Kontak & Lokasi"
        description="Data ini dipakai admin untuk verifikasi dan membantu pelanggan menemukan usaha Anda."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel>Nama pemilik / pengelola</FieldLabel>
            <input name="ownerName" type="text" placeholder="Nama lengkap" required minLength={2} maxLength={100} className={inputClass} />
          </div>
          <div>
            <FieldLabel>WhatsApp aktif</FieldLabel>
            <PhoneInput name="whatsapp" placeholder="813xxxxxxx" required className="min-h-[42px]" />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel hint="Cukup alamat usaha atau titik area, tanpa data rumah pribadi yang tidak perlu.">Alamat / lokasi usaha</FieldLabel>
            <input name="address" type="text" placeholder="Contoh: Jl. Angkasa, Kemayoran, Jakarta Pusat" required minLength={8} maxLength={240} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel optional hint="Isi bila Anda menerima pesanan atau pengiriman ke area tertentu.">Area layanan</FieldLabel>
            <input name="serviceArea" type="text" placeholder="Contoh: Kemayoran, Jakarta Pusat, dan sekitarnya" maxLength={160} className={inputClass} />
          </div>
        </div>
      </FormSection>

      <FormSection
        number="03"
        icon="edit"
        title="Profil & Kehadiran Usaha"
        description="Informasi ringkas ini membantu admin menilai kesiapan profil sebelum dipublikasikan."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel hint="Tulis 1–3 kalimat tentang produk unggulan, keunikan, atau cara pemesanan.">Deskripsi singkat usaha</FieldLabel>
            <textarea name="description" rows={4} required minLength={20} maxLength={600} placeholder="Contoh: Menyediakan nasi box rumahan dengan menu harian, bisa untuk rapat dan acara keluarga. Pesanan H-1 melalui WhatsApp." className={`${inputClass} resize-y`} />
          </div>
          <div>
            <FieldLabel optional>Jam operasional</FieldLabel>
            <input name="businessHours" type="text" placeholder="Contoh: Senin–Sabtu, 08.00–17.00" maxLength={100} className={inputClass} />
          </div>
          <div>
            <FieldLabel optional hint="Boleh berupa @namatoko atau tautan Instagram.">Instagram / media sosial</FieldLabel>
            <input name="instagramHandle" type="text" placeholder="@namatoko" maxLength={160} className={inputClass} />
          </div>
        </div>
      </FormSection>

      <FormSection
        number="04"
        icon="image"
        title="Foto & Catatan"
        description="Tambahkan foto produk untuk memberi gambaran visual kepada admin."
      >
        <div className="space-y-3">
          <ImageUploader name="productImage" label="Foto produk unggulan" placeholder="URL foto produk" hint="Opsional, tetapi disarankan. Foto akan dikompres otomatis." />
          <div>
            <FieldLabel optional>Catatan untuk admin</FieldLabel>
            <textarea name="notes" rows={2} maxLength={500} placeholder="Contoh: Usaha sudah berjalan dari rumah dan menerima pesanan untuk acara kantor." className={`${inputClass} resize-y`} />
          </div>
        </div>
      </FormSection>

      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-cream-warm bg-cream-pure p-3 text-[11px] leading-relaxed text-warm-gray transition-colors hover:border-forest/30">
        <input name="consent" type="checkbox" value="accepted" required className="mt-0.5 h-4 w-4 shrink-0 rounded border-cream-warm text-forest focus:ring-forest" />
        <span>
          Saya menyatakan informasi yang diisi benar dan bersedia dihubungi admin terkait pengajuan ini. Saya memahami bahwa pengajuan akan ditinjau sebelum usaha ditampilkan di katalog.
        </span>
      </label>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={status === "sending"} className="btn-primary w-full py-3 text-sm disabled:opacity-60">
        <Icon name="send" size={15} />
        {status === "sending" ? "Mengirim Pengajuan..." : "Kirim Pengajuan UMKM"}
      </button>

      <p className="text-center text-[10px] leading-relaxed text-warm-gray md:text-xs">
        Pengajuan ini terhubung ke akun <span className="font-semibold text-noir-soft">{user.email}</span>. Admin akan meninjau data sebelum membuka akses Area Penjual.
      </p>
    </form>
  );
}
