import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Some browser extensions register media-session actions this browser doesn't support, which
// throws. Swallow those errors so they don't surface as uncaught exceptions on this page.
if ('mediaSession' in navigator) {
  const session = navigator.mediaSession
  const setActionHandler = session.setActionHandler.bind(session)
  session.setActionHandler = (action, handler) => {
    try {
      setActionHandler(action, handler)
    } catch {
      // Unsupported action: ignore.
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
