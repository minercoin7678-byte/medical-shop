import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://medical-shop-backend-v1u1.onrender.com', // ⚠️ جای این آدرس، آدرس واقعی بک‌اند رو بذار
        changeOrigin: true,
      }
    }
  }
});