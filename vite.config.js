import { defineConfig, loadEnv } from 'vite'
import process from 'node:process'
import react from '@vitejs/plugin-react'

// In dev (`npm run dev`) the app calls /api on its own origin and Vite proxies
// it to the backend. Point VITE_PROXY_TARGET at your local backend stack
// (http://localhost:5000 by default) or at production.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_PROXY_TARGET || 'http://localhost:5000'
  const proxy = { target, changeOrigin: true, secure: false }

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': proxy,
        '/health': proxy,
      },
    },
    test: {
      environment: 'jsdom',
      globals: false,
      setupFiles: './src/setupTests.js',
    },
  }
})
