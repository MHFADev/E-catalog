/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Palet "Pasar di Bawah Rindang": hijau daun dominan, biru dari logo sebagai aksen tindakan.
        forest: {
          DEFAULT: "#1F6B45",
          light: "#4F956B",
          deep: "#10482E",
          bright: "#CFE6B6",
          dark: "#173F31",
        },
        emerald: { DEFAULT: "#177E5A", dark: "#105D42", light: "#51A979" },
        hutan: { DEFAULT: "#123F2B", dark: "#09291C", light: "#245F42" },
        laut: { DEFAULT: "#147FC1", deep: "#0A4B86", light: "#B9E1F5" },
        langit: { DEFAULT: "#DDF2FC", light: "#F0FAFF", deep: "#65BCE8" },
        cream: { DEFAULT: "#FBFAF2", warm: "#E8EAD9", pure: "#FFFFFF" },
        clay: { DEFAULT: "#D98A2B", light: "#F0B55F", deep: "#A95F13" },
        noir: { DEFAULT: "#173247", soft: "#315166", light: "#668091" },
        "energy-gold": "#D98A2B",
        "warm-gray": "#6A7A72",
        "cool-gray": "#496172",
        muted: "#81918A",
      },
      fontFamily: {
        display: ["Georgia", "Times New Roman", "serif"],
        sans: ["Inter", "Aptos", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Consolas", "monospace"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(23, 63, 49, 0.04), 0 10px 24px rgba(23, 63, 49, 0.08)",
        "card-hover": "0 4px 10px rgba(23, 63, 49, 0.08), 0 20px 42px rgba(23, 63, 49, 0.16)",
        navbar: "0 1px 2px rgba(23, 63, 49, 0.04), 0 8px 28px rgba(23, 63, 49, 0.06)",
      },
    },
  },
  plugins: [],
};
