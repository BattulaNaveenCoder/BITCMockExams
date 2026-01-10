import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@config': fileURLToPath(new URL('./src/shared/config', import.meta.url)),
      '@api': fileURLToPath(new URL('./src/shared/api', import.meta.url)),
      '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@contexts': fileURLToPath(new URL('./src/contexts', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/a2z-tests': {
        target: 'https://a2z-tests.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/a2z-tests/, ''),
      },
      '/a2z-identity': {
        target: 'https://a2z-identity.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/a2z-identity/, ''),
      },
      '/subscriptionapi': {
        target: 'https://subscriptionapi.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/subscriptionapi/, ''),
      },
      // New: proxy BestITCourses API to avoid CORS in dev
      '/api': {
        target: 'https://www.bestitcourses.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  build: {
    // Optimize chunk sizes for fast initial load
    chunkSizeWarningLimit: 500,
    target: 'esnext',
    minify: 'esbuild',
    // Enable module preload for faster chunk loading
    modulePreload: {
      polyfill: true,
    },
    rollupOptions: {
      output: {
        // Safer manual chunks - avoid circular dependency issues
        manualChunks: (id) => {
          // React core - small, cached long-term
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          // Router - needed for navigation
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          // Google OAuth - defer loading
          if (id.includes('@react-oauth/google')) {
            return 'oauth';
          }
          // Icons - often large
          if (id.includes('react-icons')) {
            return 'icons';
          }
          // Axios
          if (id.includes('node_modules/axios')) {
            return 'http-client';
          }
          // JWT handling
          if (id.includes('jwt-decode')) {
            return 'jwt';
          }
          // Let Vite handle these automatically to avoid circular deps
        },
        // Optimize chunk file naming for caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId || '';
          // Pages get their own chunks with clear names
          if (facadeModuleId.includes('/pages/')) {
            const pageName = facadeModuleId.split('/pages/')[1]?.split('/')[0] || 'page';
            return `pages/${pageName}-[hash].js`;
          }
          return 'chunks/[name]-[hash].js';
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Enable source maps for production debugging (optional)
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
  },
})
