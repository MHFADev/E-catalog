"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "@/components/common/Icon";
import { submitOnboarding } from "@/app/onboarding/actions";

// ============================================================
// Wizard onboarding gaya aplikasi mobile (multi-step):
// Username -> Tanggal Lahir -> Nomor HP.
// - "Next"  : slide keluar ke kiri, step baru masuk dari kanan.
// - "Back"  : arah kebalikannya (slide ke kanan).
// - Submit  : UPDATE tabel profiles yang sudah ada, is_onboarded = true.
// ============================================================

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-2xl px-4 py-3 text-sm md:text-base text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-4 focus:ring-forest/10 transition-all";

const steps = [
  {
    key: "username",
    icon: "idCard",
    title: "Pilih Username",
    subtitle: "Identitas unik kamu di katalog — dipakai untuk komentar & checkout.",
  },
  {
    key: "dateOfBirth",
    icon: "calendar",
    title: "Tanggal Lahir",
    subtitle: "Biar kita bisa menyapa dan menyesuaikan layanan untuk kamu.",
  },
  {
    key: "phoneNumber",
    icon: "phone",
    title: "Nomor HP / WhatsApp",
    subtitle: "Otomatis terisi di checkout. Penjual bisa menghubungimu.",
  },
];

const slideVariants = {
  enter: (dir) => ({ x: dir >= 0 ? 90 : -90, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir >= 0 ? -90 : 90, opacity: 0 }),
};

export default function OnboardingWizard({ profile, canRenameUsername }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const usernameLocked =
    !canRenameUsername && profile?.username && profile.username !== "";

  const {
    register,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: profile?.username || "",
      dateOfBirth: profile?.date_of_birth || "",
      phoneNumber: profile?.phone_number || "",
    },
  });

  const goNext = async () => {
    const field = steps[step].key;
    const valid = await trigger(field);
    if (!valid) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const onSubmit = async (values) => {
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("username", values.username || "");
      fd.set("dateOfBirth", values.dateOfBirth || "");
      fd.set("phoneNumber", values.phoneNumber || "");
      const res = await submitOnboarding(fd);
      if (res?.ok) {
        setDone(true);
        router.refresh();
      }
    } catch (ex) {
      setError(ex.message || "Gagal menyimpan profil.");
    }
    setBusy(false);
  };

  // ===== Layar sukses =====
  if (done) {
    return (
      <div className="bg-white rounded-3xl p-8 md:p-10 border border-cream-warm text-center max-w-md mx-auto shadow-xl">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"
        >
          <Icon name="check" size={30} />
        </motion.div>
        <h2 className="text-lg md:text-xl font-bold text-noir mb-1">
          Profil Lengkap!
        </h2>
        <p className="text-sm text-warm-gray leading-relaxed mb-6">
          Terima kasih sudah melengkapi data. Kamu sudah siap menjelajah
          katalog, mengirim komentar, dan berbelanja.
        </p>
        <button
          onClick={() => router.push("/")}
          className="btn-primary w-full text-sm py-3"
        >
          Lanjut ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 border border-cream-warm max-w-md mx-auto shadow-xl overflow-hidden">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, i) => (
          <span
            key={s.key}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= step ? "bg-forest w-8" : "bg-cream-warm w-4"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="popLayout" custom={direction} initial={false}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease: "easeInOut" }}
          className="min-h-[280px] flex flex-col"
        >
          <div className="mb-5 text-center">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-forest/10 text-forest mb-3">
              <Icon name={steps[step].icon} size={22} />
            </span>
            <h2 className="text-lg md:text-xl font-bold text-noir">
              {steps[step].title}
            </h2>
            <p className="text-xs md:text-sm text-warm-gray mt-1 leading-relaxed">
              {steps[step].subtitle}
            </p>
          </div>

          {/* Step 1: Username */}
          {step === 0 && (
            <div className="flex-1">
              <label className="block text-xs font-semibold text-noir-soft mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                  @
                </span>
                <input
                  {...register("username", {
                    required: "Username wajib diisi",
                    pattern: {
                      value: /^[a-z0-9_]{3,20}$/,
                      message:
                        "Huruf kecil, angka, atau underscore (3-20 karakter).",
                    },
                    validate: (v) => {
                      if (usernameLocked && v === profile.username) return true;
                      return true;
                    },
                  })}
                  readOnly={usernameLocked}
                  placeholder="username_kamu"
                  className={`${inputClass} pl-9 ${usernameLocked ? "opacity-70 cursor-not-allowed" : ""}`}
                />
              </div>
              {errors.username && (
                <p className="mt-1.5 text-[11px] text-red-600">
                  {errors.username.message}
                </p>
              )}
              {usernameLocked && (
                <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  Username sudah pernah diubah — sesuai aturan, bisa diganti lagi
                  setelah 2 tahun. Username kamu tetap: @{profile.username}.
                </p>
              )}
            </div>
          )}

          {/* Step 2: Tanggal lahir */}
          {step === 1 && (
            <div className="flex-1">
              <label className="block text-xs font-semibold text-noir-soft mb-1.5">
                Tanggal Lahir
              </label>
              <input
                type="date"
                {...register("dateOfBirth", {
                  required: "Tanggal lahir wajib diisi",
                  validate: (v) => {
                    if (!v) return true;
                    const d = new Date(`${v}T00:00:00`);
                    if (Number.isNaN(d.getTime())) return "Format tanggal tidak valid.";
                    if (d.getTime() > Date.now())
                      return "Tanggal lahir tidak boleh di masa depan.";
                    return true;
                  },
                })}
                max={new Date().toISOString().slice(0, 10)}
                className={inputClass}
              />
              {errors.dateOfBirth && (
                <p className="mt-1.5 text-[11px] text-red-600">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>
          )}

          {/* Step 3: Nomor HP */}
          {step === 2 && (
            <div className="flex-1">
              <label className="block text-xs font-semibold text-noir-soft mb-1.5">
                Nomor HP / WhatsApp
              </label>
              <input
                type="tel"
                {...register("phoneNumber", {
                  pattern: {
                    value: /^\+?[0-9]{8,16}$/,
                    message:
                      "Nomor tidak valid. Gunakan angka, boleh diawali +62.",
                  },
                })}
                placeholder="cth. 81234567890 atau +6281234567890"
                inputMode="tel"
                className={inputClass}
              />
              {errors.phoneNumber && (
                <p className="mt-1.5 text-[11px] text-red-600">
                  {errors.phoneNumber.message}
                </p>
              )}
              <p className="mt-2 text-[11px] text-warm-gray">
                Akan otomatis terisi saat checkout, jadi kamu tidak perlu
                mengetik ulang.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {error && (
        <p className="mt-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Navigasi */}
      <div className="mt-6 flex items-center gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={goBack}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-cream-warm text-sm font-semibold text-noir-soft hover:bg-cream transition-all disabled:opacity-50"
          >
            <Icon name="arrowLeft" size={15} /> Kembali
          </button>
        ) : (
          <span className="flex-1" />
        )}

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="btn-primary flex-1 text-sm py-3"
          >
            Lanjut <Icon name="arrowRight" size={15} />
          </button>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1">
            <button
              type="submit"
              disabled={busy}
              className="btn-primary w-full text-sm py-3 disabled:opacity-60"
            >
              {busy ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  Selesai <Icon name="check" size={15} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
