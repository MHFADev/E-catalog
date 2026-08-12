"use client";
import { useState } from "react";
import Icon from "@/components/common/Icon";

// ============================================================
// PaymentLogo — menampilkan LOGO RESMI provider pembayaran
// (SVG/PNG resmi dari Wikimedia), bukan ikon generik.
// Menerima methodName (kode provider ATAU label seperti
// "Bank BCA" / "DANA") dan methodType untuk fallback.
// Bila gambar gagal / provider tidak dikenali -> ikon brand
// (atau ikon bank/e-wallet generik yang bersih).
// ============================================================

// URL logo resmi (sudah diverifikasi reachable).
const LOGO_URLS = {
  qris: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg",
  bca: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg",
  mandiri: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg",
  bri: "https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_BRI.png",
  bni: "https://upload.wikimedia.org/wikipedia/commons/f/fa/BNI_logo_2014.svg",
  cimb: "https://upload.wikimedia.org/wikipedia/commons/3/38/CIMB_Niaga_logo.svg",
  permata: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Permata_Bank_%282024%29.svg",
  btn: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Bank_BTN_logo.svg",
  danamon: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Danamon_%282024%29.svg",
  gopay: "https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg",
  dana: "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg",
  ovo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg",
  shopeepay: "https://upload.wikimedia.org/wikipedia/commons/f/fe/ShopeePay_Logo.svg",
  linkaja: "https://upload.wikimedia.org/wikipedia/commons/8/85/LinkAja.svg",
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
  if (LOGO_URLS[raw]) return raw;
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
  const url = key ? LOGO_URLS[key] : null;

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
