import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'd3': ['d3-scale', 'd3-axis', 'd3-shape', 'd3-selection']
        }
      }
    }
  },
  server: {
    port: 5173,
    open: false
  }
})
