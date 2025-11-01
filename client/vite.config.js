import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        require('@tailwindcss/postcss')(), // ✅ نسخه جدید
        require('autoprefixer'),
      ],
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://medical-shop-backend-v1u1.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      }
    }
  }
});