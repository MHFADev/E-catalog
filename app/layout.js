import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import OnboardingGate from "@/components/onboarding/OnboardingGate";

export const metadata = {
  title: "UMKM Kemayoran — Katalog Digital Produk Lokal",
  description:
    "Temukan produk UMKM unggulan dari Kemayoran, Gunung Putri, Bogor. Belanja langsung dari pengrajin lokal.",
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
          <main className="min-h-screen pt-3 md:pt-4">{children}</main>
        </PageTransition>
        <Footer />
      </body>
    </html>
  );
}
