// src/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'medical-blue': '#0D4A6B',
      'medical-blue-dark': '#1E567A',
      'trust-green': '#2E8B57',
      'light-bg': '#F8FAFC', // ✅ این خط باید وجود داشته باشه
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require("daisyui")
  ],
  daisyui: {
    themes: false, // غیرفعال کردن تم‌های پیش‌فرض برای کنترل کامل
  },
}