import ImportForm from "./ImportForm";

export const dynamic = "force-dynamic";

export default function UmkmImportPage() {
  return (
    <div className="max-w-3xl space-y-5">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-ocean">Impor terproteksi</p>
        <h2 className="mt-1 text-xl md:text-2xl font-bold tracking-tight text-noir">Impor UMKM dari spreadsheet</h2>
        <p className="mt-2 text-sm text-warm-gray leading-relaxed">
          Proses ini membuat akun penjual berdasarkan nomor telepon, toko, akses toko bersama untuk kontak yang sama, serta produk awal. Foto diproses terpisah agar katalog inti tetap aman jika ada tautan Drive yang bermasalah.
        </p>
      </section>
      <ImportForm />
    </div>
  );
}
