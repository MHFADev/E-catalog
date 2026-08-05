"use client";
import { useActionState, useState } from "react";
import Icon from "@/components/common/Icon";
import { login } from "./actions";

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-cream-warm">
          <h1 className="text-xl font-bold tracking-tight mb-1">
            Panel <span className="text-forest">Admin</span>
          </h1>
          <p className="text-xs text-warm-gray mb-5">
            Masuk untuk mengelola katalog
          </p>

          <form action={formAction} className="space-y-3">
            <input
              type="email"
              name="email"
              placeholder="Email admin"
              required
              autoComplete="username"
              className={inputClass}
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Kata sandi"
                required
                autoComplete="current-password"
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-forest transition-colors"
              >
                <Icon name={showPassword ? "eyeOff" : "eye"} size={18} />
              </button>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="btn-primary w-full text-sm py-2.5 disabled:opacity-60"
            >
              {pending ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {state?.error && (
            <p className="mt-3 text-xs text-forest bg-forest/5 border border-forest/20 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <p className="mt-4 text-center text-xs text-warm-gray">
            Akun admin diatur lewat environment variable
          </p>
        </div>
      </div>
    </div>
  );
}
