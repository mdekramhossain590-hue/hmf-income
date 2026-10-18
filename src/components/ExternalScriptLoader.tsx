import React, { useEffect } from 'react';

export const ExternalScriptLoader: React.FC = () => {
  useEffect(() => {
    // Delay loading external ad/tracking scripts until after authentication & page load complete
    const timer = setTimeout(() => {
      const loadScript = (src: string) => {
        try {
          if (document.querySelector(`script[src="${src}"]`)) return;
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          script.onerror = () => {
            console.warn(`External script load was blocked or failed gracefully: ${src}`);
          };
          document.body.appendChild(script);
        } catch (err) {
          console.warn('Script injection error:', err);
        }
      };

      loadScript('https://thorpejoy.com/3c/a5/0d/3ca50d1c91aa7d234fef5300f1599aab.js');
      loadScript('https://thorpejoy.com/a2/e3/96/a2e3968480a6be43605303c400845909.js');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return null;
};
