import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import AdminLoginForm from "./AdminLoginForm";

// [FIX] Halaman login admin jadi Server Component supaya bisa cek session via cookie httpOnly
// Kalau sudah login (cookie admin_auth valid), redirect ke /admin biar gak perlu login ulang
export default async function AdminLoginPage() {
  const admin = await isAdmin();
  if (admin) {
    redirect("/admin");
  }

  return <AdminLoginForm />;
}