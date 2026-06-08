import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      devOptions: {
        enabled: true, // <--- AGREGA ESTO
        type: 'module'
      },
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'], // Asegúrate de tener un favicon en tu carpeta public
      manifest: {
        name: 'Prode La Ronda 2026',
        short_name: 'Prode 2026',
        description: 'Prode del Mundial 2026 - Comunidad La Ronda',
        theme_color: '#0f172a', // Este es el color de tu fondo (slate-900)
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png', // Asegúrate de tener este archivo en /public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // Asegúrate de tener este archivo en /public
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})