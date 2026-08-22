/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { execSync } from 'node:child_process'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Qué build es esta. Viaja en cada fila de `error_log` para poder responder
 * "¿esto empezó con el último deploy?" — que es la primera pregunta cuando algo
 * se rompe y la que sin este dato no se puede contestar.
 *
 * En Vercel viene dado; en local se saca de git. Si las dos fallan, 'desconocida'
 * es preferible a romper el build por un dato de diagnóstico.
 */
function versionDeLaApp() {
  const deVercel = process.env.VERCEL_GIT_COMMIT_SHA
  if (deVercel) return deVercel.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return 'desconocida'
  }
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(versionDeLaApp()),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // El registro lo hace src/lib/actualizacion.js, NO el script que inyecta
      // el plugin. Aquel solo preguntaba por una versión nueva al cargar el
      // documento, y una PWA instalada casi nunca carga el documento de cero:
      // se quedaba con el build viejo indefinidamente. Ver ese archivo.
      injectRegister: false,
      devOptions: {
        enabled: true,
      },
      includeAssets: ['icon.svg', 'favicon.svg', 'favicon.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-192.png', 'icon-maskable-512.png'],
      manifest: {
        name: 'Aprende Nawat',
        short_name: 'Aprende Nawat',
        description: 'Aprende náhuat, el idioma ancestral de El Salvador',
        theme_color: '#2D6A4F',
        background_color: '#FFF8F0',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'es',
        categories: ['education', 'language'],
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,png,webp}'],
        // Sin esto, las precachés de builds anteriores se acumulan en el
        // teléfono de la gente para siempre.
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
  server: {
    // Respeta el puerto asignado por el entorno (p. ej. preview/autoPort);
    // si no hay, usa el 5173 por defecto de Vite.
    port: Number(process.env.PORT) || 5173,
  },
  build: {
    rollupOptions: {
      output: {
        // Separa las dependencias en chunks propios para que las actualizaciones
        // de código de la app no invaliden la caché del vendor (sostenibilidad).
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('/motion/') || id.includes('framer-motion')) return 'motion'
          return 'vendor'
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
    include: ['src/test/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  },
})
