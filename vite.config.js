import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Relative path for GitHub Pages deployment
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-v${Date.now()}.js`,
        chunkFileNames: `assets/[name]-v${Date.now()}.js`,
        assetFileNames: `assets/[name]-v${Date.now()}[extname]`,
      }
    }
  }
})
