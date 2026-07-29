import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'UMKM Ciangsana — Katalog Digital Produk Lokal',
  description: 'Temukan produk UMKM unggulan dari Ciangsana, Gunung Putri, Bogor. Belanja langsung dari pengrajin lokal.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        <main className="min-h-screen pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  )
}