import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Frontend memanggil /api/... dan Vite meneruskannya ke server Express.
    // Dengan proxy ini tidak ada masalah CORS saat development.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
