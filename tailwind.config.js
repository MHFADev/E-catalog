/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#1E7A3D",
          light: "#2F9152",
          deep: "#166B33",
          bright: "#3FBF5F",
          dark: "#0B3319",
        },
        hutan: { DEFAULT: "#0B3319", dark: "#062012", light: "#0F3D22" },
        laut: { DEFAULT: "#1E3A8A", deep: "#172A6E", light: "#2563EB" },
        langit: { DEFAULT: "#3B82F6", light: "#60A5FA", deep: "#2563EB" },
        cream: { DEFAULT: "#FAF7F0", warm: "#F3EDDF", pure: "#FFFDF8" },
        clay: { DEFAULT: "#F97316", light: "#FB923C", deep: "#EA580C" },
        noir: { DEFAULT: "#18211B", soft: "#26332A", light: "#3A4A3F" },
        "energy-gold": "#D4A017",
        "warm-gray": "#8B8680",
        "cool-gray": "#5C5A56",
        muted: "#A8A39A",
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
