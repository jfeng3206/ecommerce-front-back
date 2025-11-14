/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0f172a',
          light: '#1d293d',
          accent: '#f97316',
        },
      },
    },
  },
  plugins: [],
}
