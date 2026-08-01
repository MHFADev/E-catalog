import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "UMKM Kemayoran — Katalog Digital Produk Lokal",
  description:
    "Temukan produk UMKM unggulan dari Ciangsana, Gunung Putri, Bogor. Belanja langsung dari pengrajin lokal.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" />
        <Navbar />
        <main className="min-h-screen pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
