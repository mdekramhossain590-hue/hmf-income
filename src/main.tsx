import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './components/ThemeProvider';
import { LanguageProvider } from './components/LanguageProvider';

import './pwa';

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
