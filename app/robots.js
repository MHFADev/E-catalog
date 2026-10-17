import { getSiteUrl } from "@/lib/siteUrl";

export default function robots() {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/profile",
        "/settings",
        "/onboarding",
        "/seller/orders",
        "/seller/payment",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
