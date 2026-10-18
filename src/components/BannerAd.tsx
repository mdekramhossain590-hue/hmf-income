import React, { useEffect, useRef } from 'react';

export const BannerAd: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Clear previous content if any
      containerRef.current.innerHTML = '';

      // Set global atOptions required for iframe banner ad
      (window as any).atOptions = {
        'key': '9821bd456f951b9d4f2aada29726654c',
        'format': 'iframe',
        'height': 60,
        'width': 468,
        'params': {}
      };

      const script = document.createElement('script');
      script.src = 'https://thorpejoy.com/9821bd456f951b9d4f2aada29726654c/invoke.js';
      script.async = true;
      script.onerror = () => {
        console.warn('Banner ad script failed or was blocked by adblocker.');
      };

      containerRef.current.appendChild(script);
    } catch (err) {
      console.warn('Error rendering banner ad:', err);
    }
  }, []);

  return (
    <div className="w-full flex justify-center my-4 overflow-hidden min-h-[60px]">
      <div 
        ref={containerRef} 
        className="flex justify-center items-center max-w-full overflow-hidden" 
        style={{ width: '468px', height: '60px' }} 
      />
    </div>
  );
};
