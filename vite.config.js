import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.rwandaavocados.rw',
        changeOrigin: true, // Rewrites Host header to target domain
        secure: false,      // Ignores SSL certificate errors if any
      },
      '/health': {
        target: 'https://api.rwandaavocados.rw',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: './src/setupTests.js',
  },
})