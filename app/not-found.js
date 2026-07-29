import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 py-16">
      <h1 className="text-8xl md:text-[10rem] font-bold tracking-tighter leading-none text-cherry">
        404
      </h1>
      <h2 className="text-2xl font-semibold mt-4 mb-2">
        Halaman tidak ditemukan
      </h2>
      <p className="text-warm-gray mb-8 max-w-sm">
        Halaman yang kamu cari mungkin sudah dipindah atau tidak tersedia.
      </p>
      <Link href="/catalog" className="btn-primary">
        Kembali ke Katalog
      </Link>
    </div>
  );
}
