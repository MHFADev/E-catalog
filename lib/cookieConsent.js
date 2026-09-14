/**
 * Manajemen Izin Cookie & Penyimpanan Lokal (Cookie Consent Management)
 * Sesuai standar privasi profesional (GDPR / ePrivacy Best Practices)
 */

export const CONSENT_STORAGE_KEY = "umkm_cookie_consent";
export const COOKIE_NAME = "cookie_consent";

export function getCookieConsent() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.status) {
        return parsed;
      }
    }

    // Fallback: periksa document.cookie
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
    if (match) {
      const val = decodeURIComponent(match[1]);
      if (val === "accepted") {
        return { status: "accepted", functional: true, analytics: true };
      }
      if (val === "declined") {
        return { status: "declined", functional: false, analytics: false };
      }
    }
  } catch {
    // Abaikan jika storage diblokir
  }

  return null;
}

export function setCookieConsent({ status, functional = true, analytics = false }) {
  if (typeof window === "undefined") return;

  const payload = {
    status, // "accepted" | "declined" | "custom"
    functional: Boolean(functional),
    analytics: Boolean(analytics),
    updatedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Abaikan error storage
  }

  try {
    const maxAge = 365 * 24 * 60 * 60; // 1 tahun
    const cookieVal = encodeURIComponent(status);
    document.cookie = `${COOKIE_NAME}=${cookieVal}; max-age=${maxAge}; path=/; SameSite=Lax`;
  } catch {
    // Abaikan error cookie
  }

  // Notifikasi ke seluruh komponen yang mendengarkan perubahan consent
  try {
    window.dispatchEvent(new CustomEvent("cookie-consent-changed", { detail: payload }));
  } catch {
    // Abaikan jika browser lawas
  }
}

export function hasFunctionalConsent() {
  const consent = getCookieConsent();
  if (!consent) return true; // Belum memilih -> diizinkan default untuk UX awal
  if (consent.status === "accepted") return true;
  if (consent.status === "declined") return false;
  return Boolean(consent.functional);
}

export function openCookieSettings() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("open-cookie-settings"));
}
