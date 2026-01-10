import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { initPerformanceMonitoring } from './shared/utils/performance'

// Lazy load GoogleOAuthProvider to reduce initial bundle
const GoogleOAuthProvider = lazy(() => 
  import('@react-oauth/google').then(module => ({ 
    default: module.GoogleOAuthProvider 
  }))
);

// Eager load App for critical path
import App from '@app/App'
import { authConfig } from './shared/config/auth'

// Initialize performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  initPerformanceMonitoring();
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <Suspense fallback={<div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>Loading...</div>}>
      <GoogleOAuthProvider clientId={authConfig.googleClientId}>
        <App />
      </GoogleOAuthProvider>
    </Suspense>
  </StrictMode>,
)
