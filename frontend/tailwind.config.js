/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'apple-red': '#fa233b',
        'apple-dark': '#1c1c1e',
        'apple-gray': '#2c2c2e',
      }
    },
  },
  plugins: [],
}