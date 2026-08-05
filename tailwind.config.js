/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#00A94F",
          light: "#14C566",
          deep: "#007F3D",
          bright: "#3EE07E",
          dark: "#064D2C",
        },
        hutan: { DEFAULT: "#0B3B24", dark: "#062417", light: "#105C38" },
        laut: { DEFAULT: "#1E3A8A", deep: "#172A6E", light: "#2563EB" },
        langit: { DEFAULT: "#3B82F6", light: "#60A5FA", deep: "#2563EB" },
        cream: { DEFAULT: "#F5F6F8", warm: "#EDEFF3", pure: "#FFFFFF" },
        clay: { DEFAULT: "#F97316", light: "#FB923C", deep: "#EA580C" },
        noir: { DEFAULT: "#18211B", soft: "#26332A", light: "#3A4A3F" },
        "energy-gold": "#D4A017",
        "warm-gray": "#9AA1A8",
        "cool-gray": "#4B5563",
        muted: "#B4BAC0",
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
        card: "0 1px 2px rgba(6, 77, 44, 0.05), 0 2px 8px rgba(6, 77, 44, 0.06)",
        "card-hover":
          "0 2px 4px rgba(6, 77, 44, 0.08), 0 10px 28px rgba(6, 77, 44, 0.14)",
        navbar:
          "0 1px 2px rgba(24, 33, 27, 0.04), 0 4px 12px rgba(24, 33, 27, 0.05)",
      },
    },
  },
  plugins: [],
};
