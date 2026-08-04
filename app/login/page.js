"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
      router.push(next);
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name.trim() || null } },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    if (data.session) {
      router.push(next);
      router.refresh();
    } else {
      setMessage("Akun dibuat. Cek email untuk konfirmasi, lalu masuk.");
    }
    setBusy(false);
  };

  return (
    <div className="min-h-[60vh] bg-cream flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-cream-warm">
          <h1 className="text-xl font-bold tracking-tight mb-1">
            Masuk <span className="text-forest">Akun</span>
          </h1>
          <p className="text-xs text-warm-gray mb-5">
            Login untuk mengirim komentar dan menilai produk.
          </p>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap (opsional)"
                className={inputClass}
              />
            )}
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
              {busy ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar Akun"}
            </button>
          </form>

          {/* [LOGIN] Notif error (mis. "Invalid login credentials") kini berwarna merah */}
          {error && (
            <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {message && (
            <p className="mt-3 text-xs text-noir-soft bg-cream-warm rounded-lg px-3 py-2 leading-relaxed">
              {message}
            </p>
          )}

          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
              setMessage("");
            }}
            className="mt-4 w-full text-xs text-warm-gray hover:text-forest transition-colors"
          >
            {mode === "login"
              ? "Belum punya akun? Daftar sekarang"
              : "Sudah punya akun? Masuk"}
          </button>
        </div>

        <p className="text-center mt-4">
          <Link
            href="/"
            className="text-xs text-warm-gray hover:text-forest transition-colors"
          >
            â† Kembali ke Beranda
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
