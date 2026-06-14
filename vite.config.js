import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'], 
      manifest: {
        name: 'NXT Notes',
        short_name: 'NXTNotes',
        description: 'Premium Cloud-Connected Notes Application',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // यह ब्राउज़र का URL बार हटाकर फुल स्क्रीन ऐप बना देगा
        orientation: 'portrait',
        icons: [
          {
            src: '/logo-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
});