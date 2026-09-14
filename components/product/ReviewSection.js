"use client";
import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import { useUser } from "@/lib/useUser";
import { useProfile } from "@/lib/useProfile";

// ===== Bintang rating (5 bintang, ada/tidak aktif) =====
function Stars({ value, size = 12, className = "" }) {
  return (
    <div className={`flex gap-0.5 text-amber-500 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          name="starFilled"
          size={size}
          className={i <= value ? "" : "opacity-25"}
        />
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

// ===== Kartu satu komentar (username/avatar dari join tabel profiles) =====
function ReviewCard({ review, isOwn, onDelete, isDeleting }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const displayName = review.username || review.name || "Pengguna";

  return (
    <div
      className={`bg-white rounded-2xl p-4 md:p-5 border transition-all ${
        isOwn
          ? "border-forest/40 bg-gradient-to-br from-white to-forest/[0.02]"
          : "border-cream-warm"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {review.avatarUrl ? (
            <img
              src={review.avatarUrl}
              alt={displayName}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border border-cream-warm shrink-0"
            />
          ) : (
            <span className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-forest/10 text-forest flex items-center justify-center font-bold text-xs md:text-sm shrink-0">
              {initials(displayName)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-noir truncate">
                {displayName}
              </span>
              {isOwn && (
                <span className="text-[10px] font-semibold text-forest bg-forest/10 px-2 py-0.5 rounded-full shrink-0">
                  Ulasan Anda
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Stars value={review.rating} />
              <span className="text-[10px] md:text-xs text-warm-gray">
                {fmtDate(review.date)}
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Hapus untuk pengirim ulasan */}
        {isOwn && (
          <div className="shrink-0">
            {!showConfirm ? (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={isDeleting}
                title="Hapus rating Anda"
                className="inline-flex items-center gap-1 text-xs text-warm-gray hover:text-red-600 hover:bg-red-50 py-1 px-2 rounded-lg transition-colors"
                aria-label="Hapus rating"
              >
                <Icon name="deleteFilled" size={13} className="text-current" />
                <span className="hidden sm:inline font-medium">Hapus</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-xl p-1">
                <span className="text-[11px] font-semibold text-red-800 px-1">
                  Hapus?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirm(false);
                    onDelete(review.id);
                  }}
                  disabled={isDeleting}
                  className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                >
                  {isDeleting ? "..." : "Ya"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  className="px-2 py-0.5 bg-white hover:bg-cream-warm text-cool-gray rounded-lg text-xs font-medium border border-cream-warm transition"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <p className="text-xs md:text-sm text-cool-gray leading-relaxed break-words">
        {review.comment}
      </p>
    </div>
  );
}

// ===== Form komentar baru — otomatis memakai identitas akun yang login =====
function CommentForm({ productId, onAdd, profile }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const displayName = profile?.username || "Pengguna";

  const submit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setStatus("sending");
    setError("");
    const payload = {
      productId,
      rating,
      comment: comment.trim(),
    };

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.review) {
        throw new Error(data?.error || "Rating belum dapat disimpan.");
      }

      // Hanya tampilkan setelah API mengonfirmasi data benar-benar tersimpan.
      onAdd(data.review);
      setComment("");
      setRating(5);
      setStatus("sent");
      setTimeout(() => setStatus(""), 5000);
    } catch (submitError) {
      setError(submitError.message || "Rating belum dapat disimpan.");
      setStatus("error");
    }
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

      {/* Identitas otomatis dari akun — tanpa input nama manual */}
      <div className="flex items-center gap-2.5 mb-3">
        {profile?.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={displayName}
            className="w-9 h-9 rounded-full object-cover border border-cream-warm"
          />
        ) : (
          <span className="w-9 h-9 rounded-full bg-forest/10 text-forest flex items-center justify-center font-bold text-xs shrink-0">
            {initials(displayName)}
          </span>
        )}
        <span className="text-xs md:text-sm text-noir-soft">
          Mengomentari sebagai{" "}
          <span className="font-bold text-forest">@{displayName}</span>
        </span>
      </div>

      <div className="flex items-center gap-1 bg-cream-pure border border-cream-warm rounded-xl px-3 py-2.5 mb-3">
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
            <Icon
              name="starFilled"
              size={18}
              className={i <= (hover || rating) ? "text-amber-500" : "text-muted/40"}
            />
          </button>
        ))}
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
        <p className="mt-2 text-xs text-emerald-700">
          Rating tersimpan dan sekarang tampil secara publik.
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}

// ===== Bagian utama: ringkasan rating + daftar komentar + form =====
export default function ReviewSection({ initial = [], productId }) {
  const [reviews, setReviews] = useState(initial);
  const { user, loading } = useUser();
  const { profile } = useProfile();
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

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

  const handleDeleteReview = async (reviewId) => {
    setDeletingId(reviewId);
    setFeedback(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reviewId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Rating belum dapat dihapus.");
      }

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setFeedback({
        type: "success",
        text: "Rating Anda berhasil dihapus.",
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      setFeedback({
        type: "error",
        text: err?.message || "Rating belum dapat dihapus.",
      });
      setTimeout(() => setFeedback(null), 6000);
    } finally {
      setDeletingId(null);
    }
  };

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
              <span className="w-6 text-right text-warm-gray shrink-0 flex items-center justify-end gap-0.5">
                {d.star}
                <Icon name="starFilled" size={11} />
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

      {/* Notifikasi feedback aksi rating */}
      {feedback && (
        <div
          role={feedback.type === "error" ? "alert" : "status"}
          className={`p-3.5 mb-4 rounded-2xl text-xs font-medium border flex items-center justify-between gap-2 transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon
              name={feedback.type === "success" ? "badgeCheck" : "cancelFilled"}
              size={15}
              className="shrink-0"
            />
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-current opacity-70 hover:opacity-100 shrink-0 p-1"
            aria-label="Tutup notifikasi"
          >
            <Icon name="close" size={12} />
          </button>
        </div>
      )}

      {/* Daftar komentar */}
      {reviews.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
          {reviews.map((r, i) => (
            <ReviewCard
              key={r.id || i}
              review={r}
              isOwn={Boolean(user?.id && r.userId === user.id)}
              onDelete={handleDeleteReview}
              isDeleting={deletingId === r.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-2xl border border-cream-warm mb-4 md:mb-6 text-sm text-warm-gray">
          Belum ada komentar. Jadilah yang pertama!
        </div>
      )}

      {/* Form komentar - wajib login */}
      {loading ? null : user ? (
        <CommentForm
          productId={productId}
          profile={profile}
          onAdd={(rev) => setReviews((prev) => [rev, ...prev])}
        />
      ) : (
        <div className="bg-white rounded-2xl md:rounded-3xl p-6 border border-cream-warm text-center">
          <Icon name="lock" size={20} className="text-forest mx-auto mb-2" />
          <p className="text-sm font-semibold text-noir mb-1">
            Login untuk mengirim komentar
          </p>
          <p className="text-xs text-warm-gray mb-4">
            Rating dan komentar Anda tampil setelah berhasil dikirim.
          </p>
          <Link href="/login" className="btn-primary text-sm py-2.5 px-6">
            Masuk / Daftar
          </Link>
        </div>
      )}
    </section>
  );
}
