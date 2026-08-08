"use client";
import { useEffect, useRef, useState } from "react";

// Kode negara umum (dipakai untuk input nomor WhatsApp / e-wallet).
const COUNTRIES = [
  { code: "+62", flag: "🇮🇩", country: "Indonesia" },
  { code: "+60", flag: "🇲🇾", country: "Malaysia" },
  { code: "+65", flag: "🇸🇬", country: "Singapura" },
  { code: "+63", flag: "🇵🇭", country: "Filipina" },
  { code: "+61", flag: "🇦🇺", country: "Australia" },
  { code: "+673", flag: "🇧🇳", country: "Brunei" },
];

const DEFAULT_DIAL = "+62";

function splitValue(value, defaultDial = DEFAULT_DIAL) {
  const clean = (value || "").replace(/\D/g, "");
  if (!clean) return { dial: defaultDial, number: "" };
  for (const c of COUNTRIES) {
    const digits = c.code.replace(/\D/g, "");
    if (clean.startsWith(digits)) {
      return { dial: c.code, number: clean.slice(digits.length).replace(/^0/, "") };
    }
  }
  return { dial: defaultDial, number: clean.replace(/^0/, "") };
}

// Phone input dengan kode negara otomatis di kiri.
// Kirim ke form nilai LENGKAP (cth. "62813…") lewat input hidden [name],
// jadi user tidak perlu mengetik +62/0 manual.
export default function PhoneInput({
  name,
  value,
  onChange,
  defaultValue = "",
  placeholder = "cth. 813xxxxxxx",
  required = false,
  className = "",
  disabled = false,
}) {
  const init = useRef(splitValue(value || defaultValue));
  const [dial, setDial] = useState(init.current.dial);
  const [number, setNumber] = useState(init.current.number);
  const [showPick, setShowPick] = useState(false);

  const full = `${dial.replace(/\D/g, "")}${number}`;

  // Sinkron dari prop controlled (value berubah dari luar)
  useEffect(() => {
    if (value == null) return;
    const s = splitValue(value);
    setDial(s.dial);
    setNumber(s.number);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const setFull = (nextDial, nextNumber) => {
    setDial(nextDial);
    setNumber(nextNumber);
    if (onChange) onChange(`${nextDial.replace(/\D/g, "")}${nextNumber}`);
  };

  return (
    <div
      className={`flex items-center gap-0 overflow-hidden bg-cream-pure border border-cream-warm rounded-xl focus-within:border-forest/50 focus-within:ring-2 focus-within:ring-forest/10 transition-all ${className}`}
    >
      <div className="relative shrink-0">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowPick((v) => !v)}
          className="flex items-center gap-1 px-2.5 md:px-3 h-full min-h-[42px] text-sm border-r border-cream-warm bg-white/60"
        >
          <span>{COUNTRIES.find((c) => c.code === dial)?.flag || "🌐"}</span>
          <span className="font-semibold text-noir">{dial}</span>
          <span className="text-[9px] text-muted">▾</span>
        </button>

        {showPick && (
          <div className="absolute left-0 top-full mt-1 z-30 w-44 bg-white border border-cream-warm rounded-xl shadow-xl overflow-hidden">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setFull(c.code, number);
                  setShowPick(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-cream-pure transition-colors ${
                  dial === c.code ? "bg-forest/5 text-forest font-bold" : "text-noir-soft"
                }`}
              >
                <span>{c.flag}</span>
                <span className="font-semibold tabular-nums">{c.code}</span>
                <span className="text-warm-gray">{c.country}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        type="tel"
        inputMode="numeric"
        value={number}
        onChange={(e) =>
          setFull(
            dial,
            e.target.value.replace(/[^\d]/g, "").replace(/^0/, ""),
          )
        }
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-label="Nomor tanpa kode negara"
        className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none"
      />

      {/* Nilai lengkap dikirim ke server (hidden field, nama = name) */}
      <input type="hidden" name={name} value={full} />
    </div>
  );
}