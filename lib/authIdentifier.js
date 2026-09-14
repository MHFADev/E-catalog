const PHONE_ALIAS_DOMAIN = "phone.umkmkemayoran.local";
const PHONE_ALIAS_RE = /^phone-\d+@phone\.umkmkemayoran\.local$/i;

export function normalizePhoneIdentifier(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("0")) {
    const normalized = `62${digits.slice(1)}`;
    return normalized.length >= 10 && normalized.length <= 15 ? `+${normalized}` : "";
  }
  if (digits.startsWith("62")) {
    return digits.length >= 10 && digits.length <= 15 ? `+${digits}` : "";
  }
  return "";
}

export function isEmailIdentifier(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function isPhoneAliasEmail(value) {
  return PHONE_ALIAS_RE.test(String(value || "").trim());
}

export function phoneFromAliasEmail(value) {
  const match = String(value || "").trim().match(/^phone-(\d+)@phone\.umkmkemayoran\.local$/i);
  return match ? `+${match[1]}` : "";
}

export function phoneAliasEmail(phone) {
  const normalized = normalizePhoneIdentifier(phone);
  if (!normalized) return "";
  return `phone-${normalized.slice(1)}@${PHONE_ALIAS_DOMAIN}`;
}

export function resolvePasswordLoginEmail(identifier) {
  const input = String(identifier || "").trim().toLowerCase();
  if (isEmailIdentifier(input)) return input;
  return phoneAliasEmail(input);
}
