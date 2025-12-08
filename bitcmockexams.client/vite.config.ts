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
      '/interview-questions': {
        target: 'https://interviewquestionsapi.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/interview-questions/, ''),
      },
      '/learning': {
        target: 'https://learningcoursesapi.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/learning/, ''),
      },
      '/a2z-events': {
        target: 'https://a2z-events.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/a2z-events/, ''),
      },
      '/a2z-news': {
        target: 'https://a2z-news.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/a2z-news/, ''),
      },
      '/training': {
        target: 'https://trainingcoursesapi.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/training/, ''),
      },
      '/search': {
        target: 'https://searchapi.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/search/, ''),
      },
      '/a2z-jobs': {
        target: 'https://a2z-jobs.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/a2z-jobs/, ''),
      },
      '/a2z-forums': {
        target: 'https://a2z-forums.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/a2z-forums/, ''),
      },
      '/youtube': {
        target: 'https://youtubevideosapi.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/youtube/, ''),
      },
      '/subscription': {
        target: 'https://subscriptionapi.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/subscription/, ''),
      },
      '/points': {
        target: 'https://pointsapi.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/points/, ''),
      },
      '/notifications': {
        target: 'https://notificationserverapi.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/notifications/, ''),
      },
      '/certifications': {
        target: 'https://certificationsapi.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/certifications/, ''),
      },
      '/a2z-feedback': {
        target: 'https://a2z-feedback.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/a2z-feedback/, ''),
      },
      '/popup': {
        target: 'https://azurea2z-popupapi.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/popup/, ''),
      },
    },
  },
})
