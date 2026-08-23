/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Turunan ikon utama: biru royal, navy buku, dan oranye hangat.
        forest: {
          DEFAULT: "#147FC1",
          light: "#3FA6DC",
          deep: "#0A3A78",
          bright: "#CBEAF8",
          dark: "#102D57",
        },
        emerald: { DEFAULT: "#058C68", dark: "#067052", light: "#10B981" },
        hutan: { DEFAULT: "#102D57", dark: "#081B37", light: "#1B4B82" },
        laut: { DEFAULT: "#147FC1", deep: "#0A3A78", light: "#65BCE8" },
        langit: { DEFAULT: "#B9E1F5", light: "#DDF2FC", deep: "#3FA6DC" },
        cream: { DEFAULT: "#FFF9F1", warm: "#FCEBD9", pure: "#FFFFFF" },
        clay: { DEFAULT: "#EF7B19", light: "#F6A54B", deep: "#C85F0A" },
        noir: { DEFAULT: "#102D57", soft: "#264467", light: "#58708A" },
        "energy-gold": "#D98A17",
        "warm-gray": "#6E8093",
        "cool-gray": "#4D6178",
        muted: "#7F97AB",
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
