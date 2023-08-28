import { resolve } from 'path';
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa';

import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: '../public',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      }
    },
    emptyOutDir: true
  },
  plugins: [
    react(),
    VitePWA ({
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon.png'
      ],
      manifest: {
        name: 'mahiro',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'assets/icons/icon_x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'assets/icons/icon_x512.png',
            sizes: '512x512',
            type: 'image/png',
          }
        ]
      }
    })
  ],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  }
})
