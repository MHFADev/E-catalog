"use client";
import { usePathname } from "next/navigation";

// Transisi halaman halus: saat route berubah, konten memudar + bergeser tipis.
export default function PageTransition({ children }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}