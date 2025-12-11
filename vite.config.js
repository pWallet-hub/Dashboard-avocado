import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', '@headlessui/react'],
          charts: ['recharts'],
          utils: ['axios', 'qrcode']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'https://dash-api-hnyp.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path
      }
    }
  },
  preview: {
    port: 3000,
    host: true
  }
})
