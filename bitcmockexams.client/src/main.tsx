import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@app/App'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { authConfig } from './shared/config/auth'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={authConfig.googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
