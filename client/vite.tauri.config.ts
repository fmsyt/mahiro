import { resolve } from 'path';
import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'tauri.dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'tauri.html'),
        config: resolve(__dirname, 'config.html'),
      }
    },
    emptyOutDir: true
  },
  plugins: [
    react(),
  ],
  clearScreen: false,
  server: {
    port: 1421,
    strictPort: true,
  },
  envPrefix: ["VITE_", "TAURI_"],
})
