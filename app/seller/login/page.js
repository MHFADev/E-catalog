"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { registerSellerAccount } from "../actions";

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all";

export default function SellerLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
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
      router.push("/seller");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }

    if (businessName.trim()) {
      const fd = new FormData();
      fd.set("businessName", businessName);
      fd.set("whatsapp", whatsapp);
      try {
        await registerSellerAccount(fd);
      } catch (ex) {
        setError(ex.message || "Gagal menyimpan profil penjual.");
        setBusy(false);
        return;
      }
    }

    if (data.session) {
      router.push("/seller");
      router.refresh();
    } else {
      setMessage("Akun dibuat. Konfirmasi email dulu, lalu masuk. Setelah masuk, lengkapi profil UMKM Anda.");
    }
    setBusy(false);
  };

  return (
    <div className="min-h-[60vh] bg-cream flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-cream-warm">
          <h1 className="text-xl font-bold tracking-tight mb-1">
            Area <span className="text-forest">Penjual</span>
          </h1>
          <p className="text-xs text-warm-gray mb-5">
            {mode === "login"
              ? "Masuk untuk kelola produk UMKM Anda"
              : "Daftar sebagai pemilik UMKM"}
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
            {mode === "signup" && (
              <>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Nama usaha UMKM Anda"
                  className={inputClass}
                />
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="No. WhatsApp usaha (cth. 628...)"
                  className={inputClass}
                />
                <p className="text-[11px] text-warm-gray leading-relaxed">
                  Setelah mendaftar, profil Anda diajukan ke admin. Setelah
                  disetujui, Anda bisa mengelola produk sendiri.
                </p>
              </>
            )}
            <button
              type="submit"
              disabled={busy}
              className="btn-primary w-full text-sm py-2.5 disabled:opacity-60"
            >
              {busy ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar & Ajukan Profil"}
            </button>
          </form>

          {error && (
            <p className="mt-3 text-xs text-forest bg-forest/5 border border-forest/20 rounded-lg px-3 py-2">
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
              ? "Belum punya akun? Daftar sebagai penjual"
              : "Sudah punya akun? Masuk"}
          </button>
        </div>
      </div>
    </div>
  );
}
