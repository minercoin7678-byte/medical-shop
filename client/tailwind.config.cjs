/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    'bg-red-100', 'border-red-500', 'text-red-800',
    'bg-blue-100', 'border-blue-500', 'text-blue-800',
    'bg-yellow-100', 'border-yellow-500', 'text-yellow-800'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}