import React, { useEffect } from 'react';

export const ExternalScriptLoader: React.FC = () => {
  useEffect(() => {
    // Clean up any previously injected popunder or external ad scripts
    try {
      const scripts = document.querySelectorAll('script[src*="thorpejoy.com"], script[src*="quge5.com"], script[src*="3nbf4.com"]');
      scripts.forEach((s) => s.remove());
    } catch (e) {}
  }, []);

  return null;
};

