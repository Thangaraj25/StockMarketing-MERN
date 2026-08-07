/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        dark: {
          bg: '#0b0f19',
          card: '#131927',
          surface: '#1b2234',
          border: '#2a344a'
        },
        bullish: '#10b981',
        bearish: '#ef4444'
      }
    },
  },
  plugins: [],
}
