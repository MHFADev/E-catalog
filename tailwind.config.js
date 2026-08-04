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
    },
  },
  plugins: [],
};
