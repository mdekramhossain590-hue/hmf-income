import React, { useEffect } from 'react';

export const AdsterraAds: React.FC = () => {
  useEffect(() => {
    // Safely load Adsterra scripts in background after app mounts
    const loadScript = (src: string, asyncAttr = true, extraAttrs: Record<string, string> = {}) => {
      try {
        if (document.querySelector(`script[src="${src}"]`)) return;
        const script = document.createElement('script');
        script.src = src;
        script.async = asyncAttr;
        Object.entries(extraAttrs).forEach(([key, val]) => {
          script.setAttribute(key, val);
        });
        script.onerror = () => {
          console.warn(`Adsterra script network load blocked or failed: ${src}`);
        };
        document.body.appendChild(script);
      } catch (err) {
        console.warn('Adsterra script injection error:', err);
      }
    };

    // Delay ad loading slightly so Firebase Auth and primary app network requests complete first
    const timer = setTimeout(() => {
      loadScript('https://doledishinflict.com/414a5d86b5f07cccbde13ae727340b02/invoke.js', true, { 'data-cfasync': 'false' });
      loadScript('https://doledishinflict.com/a2/e3/96/a2e3968480a6be43605303c400845909.js');
      loadScript('https://doledishinflict.com/3c/a5/0d/3ca50d1c91aa7d234fef5300f1599aab.js');
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return null;
};
