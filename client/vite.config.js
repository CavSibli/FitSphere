import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    cors: true
  },
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: [resolve(__dirname, 'src/styles')],
        additionalData: `
          @use "sass:color";
          @use "_variables" as *;
          @use "_mixins" as *;
        `
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@styles': resolve(__dirname, 'src/styles')
    }
  },
  build: {
    sourcemap: true
  }
})
