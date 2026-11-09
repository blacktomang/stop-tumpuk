import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  test: { exclude: ['tests/e2e/**', 'node_modules/**'] },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      manifest: {
        name: 'stop-tumpuk',
        short_name: 'stop-tumpuk',
        display: 'standalone',
        start_url: '/',
        theme_color: '#1b2623',
        background_color: '#f7f8f5',
        icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
        share_target: {
          action: '/share',
          method: 'POST',
          enctype: 'application/x-www-form-urlencoded',
          params: { title: 'title', text: 'text', url: 'url' },
        },
      },
      injectManifest: { globPatterns: ['**/*.{js,css,html,svg,png,ico}'] },
    }),
  ],
});
