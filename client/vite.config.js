import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    /* Consumed by scripts/check-bundle.mjs, which enforces the §19 budget on
       the home route. Without it the only way to measure is to eyeball the
       build log, which is exactly how the budget drifted unnoticed. */
    manifest: true,
    rollupOptions: {
      output: {
        // Keep the framework in its own chunk so app code changes don't
        // invalidate it for returning visitors (§9 performance budget).
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/.test(id)) {
            return 'react'
          }
          return undefined
        },
      },
    },
  },
})