import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      devOptions: {
        enabled: true, 
        type: 'module'
      },
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg']
    })
  ],
})