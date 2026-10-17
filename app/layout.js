import "./globals.css";
import { Manrope, Sora } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import OnboardingGate from "@/components/onboarding/OnboardingGate";
import CookieConsent from "@/components/common/CookieConsent";
import { getSiteUrl } from "@/lib/siteUrl";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const siteOrigin = getSiteUrl();

export const metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "UMKM Kemayoran — Katalog Digital Produk Lokal",
    template: "%s | UMKM Kemayoran",
  },
  description:
    "Temukan produk UMKM unggulan dari Kemayoran, Gunung Putri, Bogor. Belanja langsung dari pengrajin lokal.",
  alternates: { canonical: siteOrigin },
  keywords: [
    "UMKM Kemayoran",
    "produk lokal",
    "katalog UMKM",
    "UMKM Gunung Putri",
    "produk UMKM Bogor",
  ],
  category: "shopping",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "UMKM Kemayoran",
    url: siteOrigin,
    title: "UMKM Kemayoran — Katalog Digital Produk Lokal",
    description:
      "Jelajahi produk UMKM unggulan dan belanja langsung dari pelaku usaha lokal.",
  },
};

export default function RootLayout({ children }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteOrigin}/#organization`,
        name: "UMKM Kemayoran",
        url: siteOrigin,
        logo: `${siteOrigin}/icon.png`,
        description: "Katalog digital produk dan usaha lokal UMKM Kemayoran.",
      },
      {
        "@type": "WebSite",
        "@id": `${siteOrigin}/#website`,
        name: "UMKM Kemayoran",
        url: siteOrigin,
        inLanguage: "id-ID",
        publisher: { "@id": `${siteOrigin}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteOrigin}/catalog?search={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="id">
      <head />
      <body className={`${manrope.variable} ${sora.variable}`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <OnboardingGate />
        <Navbar />
        <PageTransition>
          <main className="min-h-screen">{children}</main>
        </PageTransition>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
