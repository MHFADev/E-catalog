import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import OnboardingGate from "@/components/onboarding/OnboardingGate";

export const metadata = {
  title: {
    default: "UMKM Kemayoran — Katalog Digital Produk Lokal",
    template: "%s | UMKM Kemayoran",
  },
  description:
    "Temukan produk UMKM unggulan dari Kemayoran, Gunung Putri, Bogor. Belanja langsung dari pengrajin lokal.",
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
    title: "UMKM Kemayoran — Katalog Digital Produk Lokal",
    description:
      "Jelajahi produk UMKM unggulan dan belanja langsung dari pelaku usaha lokal.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body suppressHydrationWarning>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" />
        <OnboardingGate />
        <Navbar />
        <PageTransition>
          <main className="min-h-screen">{children}</main>
        </PageTransition>
        <Footer />
      </body>
    </html>
  );
}
