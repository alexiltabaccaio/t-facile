/// <reference types="vitest" />
import path from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
    return {
      define: {
        'import.meta.env.VITE_GIT_BRANCH': JSON.stringify(process.env.VERCEL_GIT_COMMIT_REF || ''),
        'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
        'import.meta.env.VITE_APP_BUILD': JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'dev'),
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
            id: process.env.VERCEL_ENV === 'production' ? 't-facile-prod' : `t-facile-${process.env.VERCEL_GIT_COMMIT_REF || 'dev'}`,
            name: process.env.VERCEL_ENV === 'production' ? 'T-Facile' : 'T-Facile (Dev)',
            short_name: process.env.VERCEL_ENV === 'production' ? 'T-Facile' : 'TF Dev',
            theme_color: process.env.VERCEL_ENV === 'production' ? '#ffffff' : '#f8fafc',
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
      build: {
        chunkSizeWarningLimit: 1600,
      },
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
        exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
      }
    };
});
