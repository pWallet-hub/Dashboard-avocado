import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.rwandaavocados.rw',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
      '/health': {
        target: 'https://api.rwandaavocados.rw',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: './src/setupTests.js',
  },
})
