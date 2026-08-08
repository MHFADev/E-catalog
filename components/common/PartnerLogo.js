"use client";
import { useState } from "react";

// Logo mitra tunggal dengan fallback monogram bila file belum tersedia.
export default function PartnerLogo({ logo, tileClassName = "", imgClassName = "" }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-lg bg-forest/10 text-forest font-extrabold tracking-wide select-none ${tileClassName}`}
        title={logo.name}
      >
        {logo.initials}
      </span>
    );
  }

  return (
    <span className={tileClassName} title={logo.name}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.src}
        alt={logo.name}
        className={`w-auto object-contain ${imgClassName}`}
        onError={() => setError(true)}
        loading="lazy"
      />
    </span>
  );
}