import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Suppress harmless MediaSession API errors (often from browser extensions)
if (typeof window !== 'undefined' && 'navigator' in window && 'mediaSession' in navigator) {
  try {
    const originalSetActionHandler = navigator.mediaSession.setActionHandler.bind(navigator.mediaSession);
    navigator.mediaSession.setActionHandler = function(action: any, handler: any) {
      try {
        // Check if action is valid before calling
        const validActions = ['play', 'pause', 'seekbackward', 'seekforward', 'previoustrack', 'nexttrack', 'skipad', 'stop', 'seekto'];
        if (validActions.includes(action)) {
          return originalSetActionHandler(action, handler);
        }
        // Silently ignore invalid actions like 'enterpictureinpicture'
        return;
      } catch (error) {
        // Silently ignore all MediaSession errors
        return;
      }
    };
  } catch (e) {
    // Ignore if mediaSession is not available
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
