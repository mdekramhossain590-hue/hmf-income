import React, { useEffect } from 'react';

export const ExternalScriptLoader: React.FC = () => {
  useEffect(() => {
    // Delay loading external ad/tracking scripts until after authentication & page load complete
    const timer = setTimeout(() => {
      try {
        const src = 'https://thorpejoy.com/3c/a5/0d/3ca50d1c91aa7d234fef5300f1599aab.js';
        if (document.querySelector(`script[src="${src}"]`)) return;

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onerror = () => {
          console.warn('External script load was blocked or failed gracefully.');
        };
        document.body.appendChild(script);
      } catch (err) {
        console.warn('Script injection error:', err);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return null;
};
