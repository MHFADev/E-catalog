"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full bg-cotton-pure border border-cotton-warm rounded-xl px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-cherry/50 focus:ring-2 focus:ring-cherry/10 transition-all";

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setBusy(true);

    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
      router.push("/admin");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    if (data.session) {
      router.push("/admin");
      router.refresh();
    } else {
      setMessage(
        "Akun dibuat. Cek email Anda untuk konfirmasi, lalu masuk. Setelah itu beri tahu pemilik untuk menjalankan promote_admin(email) agar akun Anda mendapat hak admin (lihat README).",
      );
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-cotton flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-cotton-warm">
          <h1 className="text-xl font-bold tracking-tight mb-1">
            Panel <span className="text-cherry">Admin</span>
          </h1>
          <p className="text-xs text-warm-gray mb-5">
            {mode === "login"
              ? "Masuk untuk mengelola katalog"
              : "Buat akun admin baru (pertama kali)"}
          </p>

          <form onSubmit={submit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className={inputClass}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kata sandi (min. 8 karakter)"
              required
              minLength={8}
              className={inputClass}
            />
            <button
              type="submit"
              disabled={busy}
              className="btn-primary w-full text-sm py-2.5 disabled:opacity-60"
            >
              {busy
                ? "Memproses..."
                : mode === "login"
                  ? "Masuk"
                  : "Buat Akun"}
            </button>
          </form>

          {error && (
            <p className="mt-3 text-xs text-cherry bg-cherry/5 border border-cherry/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {message && (
            <p className="mt-3 text-xs text-noir-soft bg-cotton-warm rounded-lg px-3 py-2 leading-relaxed">
              {message}
            </p>
          )}

          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
              setMessage("");
            }}
            className="mt-4 w-full text-xs text-warm-gray hover:text-cherry transition-colors"
          >
            {mode === "login"
              ? "Belum punya akun? Buat akun admin baru"
              : "Sudah punya akun? Masuk"}
          </button>
        </div>
      </div>
    </div>
  );
}
