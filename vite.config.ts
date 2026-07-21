import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const basePath = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'ProjetoGym - Diário de Treino',
        short_name: 'ProjetoGym',
        description: 'Acompanhamento de treinos, cargas, progressão e músculos trabalhados.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: basePath,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/gh\/yuhonas\/free-exercise-db.*\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'exercise-db-json',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/gh\/yuhonas\/free-exercise-db.*\.jpg$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'exercise-db-images',
              expiration: { maxEntries: 1200, maxAgeSeconds: 60 * 60 * 24 * 90 }
            }
          },
          {
            urlPattern: /^https:\/\/api\.mymemory\.translated\.net\/get.*$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'instruction-translations',
              expiration: { maxEntries: 3000, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          }
        ]
      }
    })
  ]
})
