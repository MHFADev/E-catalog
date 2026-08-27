"use client";
import { useState } from "react";
import Icon from "@/components/common/Icon";

// ============================================================
// PaymentLogo — menampilkan LOGO RESMI provider pembayaran
// dari sumber brand yang dipetakan, bukan ikon generik.
// Menerima methodName (kode provider ATAU label seperti
// "Bank BCA" / "DANA") dan methodType untuk fallback.
// Bila gambar gagal / provider tidak dikenali -> ikon brand
// (atau ikon bank/e-wallet generik yang bersih).
// ============================================================

// Aset logo bermerek disimpan lokal agar tetap stabil saat halaman dibuka.
const LOGO_ASSETS = {
  qris: "/images/payment-logos/qris.svg",
  bca: "/images/payment-logos/bca.svg",
  mandiri: "/images/payment-logos/mandiri.svg",
  bri: "/images/payment-logos/bri.png",
  bni: "/images/payment-logos/bni.svg",
  cimb: "/images/payment-logos/cimb.svg",
  permata: "/images/payment-logos/permata.svg",
  btn: "/images/payment-logos/btn.svg",
  danamon: "/images/payment-logos/danamon.svg",
  gopay: "/images/payment-logos/gopay.svg",
  dana: "/images/payment-logos/dana.svg",
  ovo: "/images/payment-logos/ovo.svg",
  shopeepay: "/images/payment-logos/shopeepay.png",
  linkaja: "/images/payment-logos/linkaja.svg",
};

// Ikon brand warna (fallback bila gambar gagal dimuat).
const BRAND_ICON = {
  bca: "bankBca",
  mandiri: "bankMandiri",
  bri: "bankBri",
  bni: "bankBni",
  cimb: "bankCimb",
  permata: "bankPermata",
  btn: "bankBtn",
  danamon: "bankDanamon",
  dana: "ewalletDana",
  ovo: "ewalletOvo",
  gopay: "ewalletGopay",
  shopeepay: "ewalletShopeepay",
  linkaja: "ewalletLinkaja",
  qris: "qrcode",
};

const KNOWN = [
  "bca", "mandiri", "bri", "bni", "cimb", "permata", "btn", "danamon",
  "gopay", "dana", "ovo", "shopeepay", "linkaja", "qris",
];

// Ubah methodName / label -> kunci provider (mis. "Bank BCA" -> "bca").
function resolveKey(methodName, methodType) {
  const raw = String(methodName || "").toLowerCase();
  if (!raw) return methodType === "qris" ? "qris" : null;
  if (LOGO_ASSETS[raw]) return raw;
  if (raw === "bank" || raw === "ewallet") return null;
  for (const k of KNOWN) {
    if (raw.includes(k)) return k;
  }
  return null;
}

export default function PaymentLogo({
  methodName,
  methodType = "bank",
  imgClassName = "h-8 w-auto object-contain",
  iconSize = 20,
  className = "",
}) {
  const [failed, setFailed] = useState(false);
  const key = resolveKey(methodName, methodType);
  const url = key ? LOGO_ASSETS[key] : null;

  // Logo resmi
  if (url && !failed) {
    return (
      <img
        src={url}
        alt={String(methodName || key || "Pembayaran")}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${imgClassName} ${className}`}
      />
    );
  }

  // Fallback: ikon brand berwarna, atau ikon generik bank/e-wallet yang bersih.
  const fallbackIcon =
    (key && BRAND_ICON[key]) || (methodType === "ewallet" ? "mobile" : "bank");
  return (
    <span
      className={`inline-flex items-center justify-center text-forest ${className}`}
    >
      <Icon name={fallbackIcon} size={iconSize} />
    </span>
  );
}
