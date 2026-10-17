export function getSiteUrl() {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "https://www.umkmkemayoran.com";

  return configuredOrigin.startsWith("http")
    ? configuredOrigin.replace(/\/$/, "")
    : `https://${configuredOrigin.replace(/\/$/, "")}`;
}
