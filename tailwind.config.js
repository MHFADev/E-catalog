/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // [TEMA BIRU] Palet biru utama menggantikan hijau sebelumnya.
        // #0055A0 = biru utama (brand), #438BC4 = biru medium,
        // #8CC1E9 = biru muda, #12284B = navy gelap, #FFFFFF = krem.
        forest: {
          DEFAULT: "#0055A0",
          light: "#438BC4",
          deep: "#003D73",
          bright: "#A8D8F0",
          dark: "#0A2540",
        },
        hutan: { DEFAULT: "#12284B", dark: "#0A1628", light: "#1A4A6E" },
        laut: { DEFAULT: "#438BC4", deep: "#0D2240", light: "#5BA3D9" },
        langit: { DEFAULT: "#8CC1E9", light: "#B8D9F0", deep: "#438BC4" },
        cream: { DEFAULT: "#F5F6F8", warm: "#E8EEF4", pure: "#FFFFFF" },
        clay: { DEFAULT: "#F97316", light: "#FB923C", deep: "#EA580C" },
        noir: { DEFAULT: "#12284B", soft: "#1A2D42", light: "#4A5A6A" },
        "energy-gold": "#D4A017",
        "warm-gray": "#7A8A9A",
        "cool-gray": "#5A6A7A",
        muted: "#8AA0B0",
      },
      fontFamily: {
        display: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Consolas", "monospace"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(10, 37, 64, 0.05), 0 2px 8px rgba(10, 37, 64, 0.06)",
        "card-hover":
          "0 2px 4px rgba(10, 37, 64, 0.08), 0 10px 28px rgba(10, 37, 64, 0.14)",
        navbar:
          "0 1px 2px rgba(18, 40, 75, 0.04), 0 4px 12px rgba(18, 40, 75, 0.05)",
      },
    },
  },
  plugins: [],
};
