import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './components/ThemeProvider';
import { LanguageProvider } from './components/LanguageProvider';
import './pwa';

// Global patch for circular JSON errors from third-party libraries or internal loggers
const originalStringify = JSON.stringify;
JSON.stringify = function(value, replacer, space) {
  try {
    return originalStringify(value, replacer, space);
  } catch (e: any) {
    if (e.message && e.message.includes("circular")) {
      const cache = new Set();
      return originalStringify(value, ((key: string, val: any) => {
        if (typeof val === "object" && val !== null) {
          if (cache.has(val)) return "[Circular]";
          cache.add(val);
        }
        if (typeof replacer === "function") {
          return (replacer as any)(key, val);
        }
        return val;
      }) as any, space);
    }
    throw e;
  }
};

// Ignore benign HMR websocket connection failures in experimental preview environments
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (reason) {
    const msg = typeof reason === 'string' ? reason : (reason.message || '');
    if (msg.includes('WebSocket') || msg.includes('vite') || msg.includes('websocket')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <ThemeProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </ThemeProvider>
  </StrictMode>,
);
