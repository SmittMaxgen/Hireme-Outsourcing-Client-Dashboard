/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          500: '#F61D25',
          600: '#e11219',
          700: '#bc0c12',
        }
      }
    },
  },
  plugins: [],
}
