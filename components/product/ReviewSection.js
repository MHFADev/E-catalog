"use client";
import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import { useUser } from "@/lib/useUser";

// ===== Bintang rating (5 bintang, ada/tidak aktif) =====
function Stars({ value, size = 12, className = "" }) {
  return (
    <div className={`flex gap-0.5 text-amber-500 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{ fontSize: size }}
          className={i <= value ? "" : "opacity-25"}
        >
          â˜…
        </span>
      ))}
    </div>
  );
}

// ===== Inisial nama buat avatar bulat =====
function initials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ===== Format tanggal ISO -> "20 Jul 2026" =====
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ===== Kartu satu komentar =====
function ReviewCard({ review }) {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 border border-cream-warm">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-forest/10 text-forest flex items-center justify-center font-bold text-xs md:text-sm shrink-0">
          {initials(review.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-noir truncate">
            {review.name}
          </div>
          <div className="flex items-center gap-2">
            <Stars value={review.rating} />
            <span className="text-[10px] md:text-xs text-warm-gray">
              {fmtDate(review.date)}
            </span>
          </div>
        </div>
      </div>
      <p className="text-xs md:text-sm text-cool-gray leading-relaxed">
        {review.comment}
      </p>
    </div>
  );
}

// ===== Form komentar baru (disimpan ke database via API, moderasi admin) =====
function CommentForm({ productId, onAdd }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setStatus("sending");
    const payload = {
      productId,
      name: name.trim(),
      rating,
      comment: comment.trim(),
    };

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("gagal");
      onAdd({
        ...payload,
        date: new Date().toISOString().slice(0, 10),
      });
      setStatus("sent");
    } catch {
      // Fallback: tanpa DB, simpan lokal di perangkat ini
      onAdd({
        ...payload,
        date: new Date().toISOString().slice(0, 10),
      });
      setStatus("error");
    }

    setName("");
    setRating(5);
    setComment("");
    setTimeout(() => setStatus(""), 5000);
  };

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-cream-warm"
    >
      <h3 className="flex items-center gap-2 text-sm md:text-base font-bold text-noir mb-3">
        <Icon name="user" size={16} className="text-forest" />
        Tulis Komentar
      </h3>

      <div className="grid md:grid-cols-2 gap-3 mb-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama kamu"
          className="w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all"
        />
        {/* Pilih bintang saat hover */}
        <div className="flex items-center gap-1 bg-cream-pure border border-cream-warm rounded-xl px-3 py-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              type="button"
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(i)}
              className={`text-lg md:text-xl transition-transform hover:scale-110 ${
                i <= (hover || rating) ? "text-amber-500" : "text-muted/40"
              }`}
              aria-label={`${i} bintang`}
            >
              â˜…
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Tulis pengalamanmu tentang produk ini..."
        rows={3}
        className="w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all mb-3 resize-none"
      />

      <button
        type="submit"
        className="btn-primary w-full text-sm py-2.5"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Mengirim..." : "Kirim Komentar"}
      </button>

      {status === "sent" && (
        <p className="mt-2 text-xs text-emerald-600">
          Komentar terkirim. Akan tampil setelah disetujui admin.
        </p>
      )}
      {status === "error" && (
        <p className="mt-2 text-xs text-amber-600">
          Gagal terhubung database. Komentar tersimpan lokal di perangkat ini.
        </p>
      )}
    </form>
  );
}

// ===== Bagian utama: ringkasan rating + daftar komentar + form =====
export default function ReviewSection({ initial = [], productId }) {
  const [reviews, setReviews] = useState(initial);
  const { user, loading } = useUser();

  const total = reviews.length;
  const avg = total
    ? reviews.reduce((s, r) => s + r.rating, 0) / total
    : 0;
  const rounded = Math.round(avg);

  // Distribusi rating 5..1 untuk bar persentase
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <section>
      <h2 className="flex items-center gap-2 text-base md:text-xl font-bold tracking-tight text-noir mb-4 md:mb-6">
        <span className="w-1 h-5 md:w-1 md:h-6 bg-forest rounded-sm" />
        Komentar &amp; Penilaian
      </h2>

      {/* Ringkasan rating ala marketplace */}
      <div className="grid sm:grid-cols-[auto_1fr] gap-4 md:gap-8 bg-white rounded-2xl md:rounded-3xl p-4 md:p-7 border border-cream-warm mb-4 md:mb-6">
        <div className="text-center sm:border-r sm:border-cream-warm sm:pr-8 flex flex-col items-center justify-center">
          <div className="text-4xl md:text-5xl font-bold text-noir leading-none mb-1">
            {avg.toFixed(1)}
          </div>
          <Stars value={rounded} size={16} className="my-1.5" />
          <div className="text-[10px] md:text-xs text-warm-gray">
            {total} komentar
          </div>
        </div>
        <div className="flex flex-col justify-center gap-1.5">
          {dist.map((d) => (
            <div key={d.star} className="flex items-center gap-2 text-xs md:text-sm">
              <span className="w-6 text-right text-warm-gray shrink-0">
                {d.star}â˜…
              </span>
              <div className="flex-1 h-2 rounded-full bg-cream-warm overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-forest-light to-forest rounded-full transition-all"
                  style={{ width: `${total ? (d.count / total) * 100 : 0}%` }}
                />
              </div>
              <span className="w-6 text-warm-gray text-[10px] md:text-xs shrink-0">
                {d.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Daftar komentar */}
      {reviews.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
          {reviews.map((r, i) => (
            <ReviewCard key={r.id || i} review={r} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-2xl border border-cream-warm mb-4 md:mb-6 text-sm text-warm-gray">
          Belum ada komentar. Jadilah yang pertama!
        </div>
      )}

      {/* Form komentar â€” wajib login */}
      {loading ? null : user ? (
        <CommentForm
          productId={productId}
          onAdd={(rev) => setReviews((prev) => [rev, ...prev])}
        />
      ) : (
        <div className="bg-white rounded-2xl md:rounded-3xl p-6 border border-cream-warm text-center">
          <Icon name="lock" size={20} className="text-forest mx-auto mb-2" />
          <p className="text-sm font-semibold text-noir mb-1">
            Login untuk mengirim komentar
          </p>
          <p className="text-xs text-warm-gray mb-4">
            Komentar Anda akan tampil setelah disetujui admin.
          </p>
          <Link href="/login" className="btn-primary text-sm py-2.5 px-6">
            Masuk / Daftar
          </Link>
        </div>
      )}
    </section>
  );
}
