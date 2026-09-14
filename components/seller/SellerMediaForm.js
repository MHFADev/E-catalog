"use client";

import { useState } from "react";
import Icon from "@/components/common/Icon";
import VideoEmbed from "@/components/common/VideoEmbed";
import { saveSellerVideo } from "@/app/seller/actions";

const inputClass =
  "w-full rounded-xl border border-cream-warm bg-cream-pure px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:border-forest/50 focus:outline-none focus:ring-2 focus:ring-forest/10";

export default function SellerMediaForm({ initialUrl = "" }) {
  const [url, setUrl] = useState(initialUrl);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      action={async (formData) => {
        setMessage("");
        setError("");
        try {
          await saveSellerVideo(formData);
          setMessage("Video toko berhasil disimpan.");
        } catch (err) {
          setError(err?.message || "Video belum berhasil disimpan.");
        }
      }}
      className="space-y-3"
    >
      <div>
        <label htmlFor="seller-video-url" className="mb-1.5 block text-xs font-bold text-noir-soft">
          URL video toko
        </label>
        <input
          id="seller-video-url"
          name="videoUrl"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="YouTube, Shorts, TikTok, Instagram, Vimeo, Facebook, atau .mp4"
          className={inputClass}
        />
        <p className="mt-1.5 text-[11px] leading-relaxed text-warm-gray">
          Video akan tampil di hero katalog dengan autoplay tanpa suara. Pengunjung tetap dapat menyalakan suara atau menjeda video.
        </p>
      </div>

      {url && (
        <div className="max-w-xl rounded-2xl border border-cream-warm bg-cream-pure p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-noir-soft">
            <Icon name="play" size={12} className="text-forest" />
            Pratinjau video
          </div>
          <VideoEmbed url={url} title="Pratinjau video toko" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary px-4 py-2.5 text-sm">
          <Icon name="check" size={14} /> Simpan Video
        </button>
        {message && <span className="text-xs font-semibold text-emerald-700">{message}</span>}
        {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
      </div>
    </form>
  );
}
