import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  server: {
    port: 5174,
    host: '0.0.0.0',
    proxy: {
      // All /api/* requests → Next.js backend on port 3001
      '/api': {
        target: 'http://server-ts:3001',
        changeOrigin: true,
      },
    },
  },
})
