"use client";

import { useState } from "react";
import Icon from "@/components/common/Icon";

/**
 * Ikon kategori ilustratif bertekstur hand-drawn semi-3D.
 * Aset dipetakan dengan id kategori agar tetap bekerja untuk data Supabase maupun JSON fallback.
 */
export default function CategoryVisualIcon({
  category,
  className = "",
  fallbackSize = 18,
}) {
  const [failed, setFailed] = useState(false);
  const imageSrc = `/images/category-icons/${category.id}.png`;

  if (failed) {
    return <Icon name={category.icon} size={fallbackSize} className={className} />;
  }

  return (
    <img
      src={imageSrc}
      alt=""
      aria-hidden="true"
      draggable="false"
      className={`object-contain select-none ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
