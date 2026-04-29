/// <reference types="vitest" />
import path from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
    return {
      define: {
        'import.meta.env.VITE_GIT_BRANCH': JSON.stringify(process.env.VERCEL_GIT_COMMIT_REF || ''),
      },
      plugins: [
        tailwindcss(),
        VitePWA({
          registerType: 'prompt',
          includeAssets: ['favicon.ico', 'icon.svg', 'apple-touch-icon.png'],
          workbox: {
            navigateFallbackDenylist: [/^\/api/],
          },
          manifest: {
            id: process.env.VERCEL_ENV === 'production' ? 't-facile-prod' : 't-facile-dev',
            name: process.env.VERCEL_ENV === 'production' ? 'T-Facile' : 'T-Facile (Dev)',
            short_name: process.env.VERCEL_ENV === 'production' ? 'T-Facile' : 'T-Facile Dev',
            theme_color: '#ffffff',
            background_color: '#ffffff',
            display: 'standalone',
            icons: [
              {
                src: '/icon.svg',
                sizes: '192x192 512x512',
                type: 'image/svg+xml',
                purpose: 'any maskable'
              }
            ]
          }
        })
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
      }
    };
});
