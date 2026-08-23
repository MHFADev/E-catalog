"use client";

import { useState } from "react";
import Icon from "@/components/common/Icon";

function buildShareText(productName, sellerName) {
  return `Lihat ${productName}${sellerName ? ` dari ${sellerName}` : ""} di UMKM Kemayoran.`;
}

function copyText(value) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);

  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  document.execCommand("copy");
  document.body.removeChild(field);
  return Promise.resolve();
}

export default function ProductShare({ productName, sellerName }) {
  const [notice, setNotice] = useState("");
  const [sharing, setSharing] = useState(false);

  const getShareData = () => {
    const url = window.location.href;
    const text = buildShareText(productName, sellerName);
    return { url, text };
  };

  const openNetwork = (network) => {
    const { url, text } = getShareData();
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      x: `https://x.com/intent/post?text=${encodedText}&url=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    };

    window.open(urls[network], "_blank", "noopener,noreferrer,width=680,height=560");
  };

  const handleCopy = async () => {
    try {
      await copyText(getShareData().url);
      setNotice("Tautan produk disalin.");
    } catch {
      setNotice("Tautan belum dapat disalin. Silakan salin dari address bar.");
    }
  };

  const handleNativeShare = async () => {
    const data = getShareData();
    if (!navigator.share) {
      await handleCopy();
      return;
    }

    try {
      setSharing(true);
      await navigator.share({ title: productName, text: data.text, url: data.url });
      setNotice("Produk siap dibagikan.");
    } catch (error) {
      if (error?.name !== "AbortError") setNotice("Menu berbagi belum dapat dibuka.");
    } finally {
      setSharing(false);
    }
  };

  const options = [
    { key: "whatsapp", label: "WhatsApp", icon: "whatsapp", className: "text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366]/30" },
    { key: "facebook", label: "Facebook", icon: "facebook", className: "text-[#1877F2] hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30" },
    { key: "x", label: "X", icon: "xTwitter", className: "text-noir hover:bg-noir/5 hover:border-noir/25" },
    { key: "telegram", label: "Telegram", icon: "telegram", className: "text-[#229ED9] hover:bg-[#229ED9]/10 hover:border-[#229ED9]/30" },
  ];

  return (
    <div className="mt-4 border-t border-cream-warm pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-noir">Bagikan produk ini</p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-warm-gray">
            Dukung UMKM lokal dengan membagikan produk ini ke teman Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={handleNativeShare}
          disabled={sharing}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-forest/25 bg-forest/5 px-3 text-xs font-semibold text-forest transition-colors hover:bg-forest/10 disabled:opacity-60"
        >
          <Icon name="share" size={13} />
          {sharing ? "Membuka..." : "Bagikan"}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-1.5 sm:flex sm:flex-wrap">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => openNetwork(option.key)}
            className={`group inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-cream-warm bg-white px-2 text-[10px] font-semibold transition-all sm:px-3 sm:text-xs ${option.className}`}
            aria-label={`Bagikan ke ${option.label}`}
            title={`Bagikan ke ${option.label}`}
          >
            <Icon name={option.icon} size={15} />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={handleCopy}
          className="group inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-cream-warm bg-white px-2 text-[10px] font-semibold text-cool-gray transition-all hover:border-forest/25 hover:bg-forest/5 hover:text-forest sm:px-3 sm:text-xs"
          aria-label="Salin tautan produk"
          title="Salin tautan produk"
        >
          <Icon name="copy" size={14} />
          <span className="hidden sm:inline">Salin tautan</span>
        </button>
      </div>

      {notice && (
        <p role="status" className="mt-2 text-[11px] font-medium text-forest">
          {notice}
        </p>
      )}
    </div>
  );
}
