"use client";
import { useActionState } from "react";
import { login } from "./actions";

const inputClass =
  "w-full bg-cotton-pure border border-cotton-warm rounded-xl px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-cherry/50 focus:ring-2 focus:ring-cherry/10 transition-all";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, {});

  return (
    <div className="min-h-screen bg-cotton flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-cotton-warm">
          <h1 className="text-xl font-bold tracking-tight mb-1">
            Panel <span className="text-cherry">Admin</span>
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
            <input
              type="password"
              name="password"
              placeholder="Kata sandi"
              required
              autoComplete="current-password"
              className={inputClass}
            />
            <button
              type="submit"
              disabled={pending}
              className="btn-primary w-full text-sm py-2.5 disabled:opacity-60"
            >
              {pending ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {state?.error && (
            <p className="mt-3 text-xs text-cherry bg-cherry/5 border border-cherry/20 rounded-lg px-3 py-2">
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
