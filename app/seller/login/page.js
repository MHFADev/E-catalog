"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/common/Icon";
import { createClient } from "@/lib/supabase/client";
import { isEmailIdentifier, normalizePhoneIdentifier, resolvePasswordLoginEmail } from "@/lib/authIdentifier";
import { createPhoneAccount } from "@/app/auth/phone/actions";
import { registerSellerAccount } from "../actions";

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all";

export default function SellerLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const completeLogin = () => {
    router.push("/seller");
    router.refresh();
  };

  const createSellerProfile = async (name, phone) => {
    const formData = new FormData();
    formData.set("businessName", name.trim());
    formData.set("whatsapp", phone || "");
    await registerSellerAccount(formData);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    const supabase = createClient();
    const loginEmail = resolvePasswordLoginEmail(identifier);

    if (!loginEmail) {
      setError("Masukkan email atau nomor telepon Indonesia yang valid.");
      setBusy(false);
      return;
    }

    if (mode === "login") {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });
      if (loginError) {
        setError("Email/nomor telepon atau kata sandi tidak sesuai.");
        setBusy(false);
        return;
      }
      completeLogin();
      return;
    }

    if (!businessName.trim()) {
      setError("Nama UMKM wajib diisi.");
      setBusy(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Kata sandi tidak cocok. Silakan ketik ulang.");
      setBusy(false);
      return;
    }

    try {
      if (isEmailIdentifier(identifier)) {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: loginEmail,
          password,
          options: { data: { full_name: businessName.trim() } },
        });
        if (signupError) throw signupError;
        if (!data.session) {
          setMessage("Akun dibuat. Konfirmasi email terlebih dahulu, lalu masuk untuk melengkapi pengajuan UMKM.");
          setBusy(false);
          return;
        }
        await createSellerProfile(businessName, "");
        completeLogin();
        return;
      }

      const phone = normalizePhoneIdentifier(identifier);
      const { aliasEmail } = await createPhoneAccount({
        phone,
        password,
        fullName: businessName,
      });
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: aliasEmail,
        password,
      });
      if (loginError) throw new Error("Akun dibuat, tetapi belum dapat masuk. Silakan coba masuk kembali.");
      await createSellerProfile(businessName, phone);
      completeLogin();
    } catch (exception) {
      setError(exception.message || "Pendaftaran penjual belum berhasil.");
      setBusy(false);
    }
  };

  const googleLogin = async () => {
    setError("");
    const supabase = createClient();
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/seller")}`,
      },
    });
    if (googleError) setError(googleError.message);
  };

  const isPhone = identifier && !identifier.includes("@");

  return (
    <div className="min-h-[60vh] bg-cream flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-cream-warm">
          <h1 className="text-xl font-bold tracking-tight mb-1">
            Area <span className="text-forest">Penjual</span>
          </h1>
          <p className="text-xs text-warm-gray mb-5">
            {mode === "login" ? "Masuk untuk mengelola produk dan pesanan UMKM Anda." : "Daftarkan UMKM untuk dikelola melalui katalog."}
          </p>

          <button
            type="button"
            onClick={googleLogin}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-cream-warm text-sm font-semibold text-noir-soft hover:border-forest/40 hover:bg-cream-pure transition-all"
          >
            <Icon name="google" size={18} /> Lanjut dengan Google
          </button>

          <div className="flex items-center gap-3 my-4">
            <span className="flex-1 h-px bg-cream-warm" />
            <span className="text-[10px] uppercase tracking-wider text-muted">atau</span>
            <span className="flex-1 h-px bg-cream-warm" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <input
                type="text"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                placeholder="Nama UMKM *"
                autoComplete="organization"
                required
                className={inputClass}
              />
            )}
            <input
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Email atau nomor telepon"
              inputMode={isPhone ? "tel" : "email"}
              autoComplete="username"
              required
              className={inputClass}
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Kata sandi (min. 8 karakter)"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                minLength={8}
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-forest transition-colors"
              >
                <Icon name={showPassword ? "eyeOff" : "eye"} size={18} />
              </button>
            </div>
            {mode === "signup" && (
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Ulangi kata sandi"
                autoComplete="new-password"
                required
                minLength={8}
                className={inputClass}
              />
            )}
            <button type="submit" disabled={busy} className="btn-primary w-full text-sm py-2.5 disabled:opacity-60">
              {busy ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar & Ajukan UMKM"}
            </button>
          </form>

          {error && <p className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">{error}</p>}
          {message && <p className="mt-3 text-xs text-noir-soft bg-cream-warm rounded-lg px-3 py-2 leading-relaxed">{message}</p>}

          <button
            type="button"
            onClick={() => {
              setMode((value) => (value === "login" ? "signup" : "login"));
              setError("");
              setMessage("");
            }}
            className="mt-4 w-full text-xs text-warm-gray hover:text-forest transition-colors"
          >
            {mode === "login" ? "Belum punya akun? Daftarkan UMKM" : "Sudah punya akun? Masuk"}
          </button>
        </div>
      </div>
    </div>
  );
}
