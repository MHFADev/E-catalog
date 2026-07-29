/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cherry: { DEFAULT: '#B91C1C', light: '#DC2626', deep: '#991B1B', bright: '#EF4444' },
        maroon: { DEFAULT: '#751515', dark: '#501010', light: '#9B1B1B' },
        cotton: { DEFAULT: '#F5F0E8', warm: '#EDE4D3', pure: '#FAF8F0' },
        cream: '#E8DFC8',
        noir: { DEFAULT: '#181717', soft: '#2D2D2D', light: '#3D3D3D' },
        'energy-gold': '#D4A017',
        'warm-gray': '#8B8680',
        'cool-gray': '#5C5A56',
        muted: '#A8A39A',
      },
      fontFamily: {
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}