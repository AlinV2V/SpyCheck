import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// AUTOMATIC BROWSER CACHE PURGING LOGIC
const CURRENT_BUILD_VERSION = '1.0.32';
try {
  const storedVersion = localStorage.getItem('spycheck_build_version');
  if (storedVersion !== CURRENT_BUILD_VERSION) {
    console.log(`[CachePurger] New build detected (${CURRENT_BUILD_VERSION}). Purging stale browser cache...`);
    localStorage.setItem('spycheck_build_version', CURRENT_BUILD_VERSION);

    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(r => r.unregister());
      });
    }
  }
} catch (e) {
  console.warn('Cache purger error:', e);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
