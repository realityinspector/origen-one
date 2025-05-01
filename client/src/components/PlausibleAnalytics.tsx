import React, { useEffect } from 'react';

interface PlausibleAnalyticsProps {
  domain: string;
  enabled?: boolean;
}

export function PlausibleAnalytics({ domain, enabled = true }: PlausibleAnalyticsProps) {
  useEffect(() => {
    // Only load Plausible if stats are enabled
    if (!enabled) return;

    // Create script element
    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = domain;
    script.src = 'https://plausible.io/js/script.js';
    
    // Add script to document
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [domain, enabled]);

  return null; // This component doesn't render anything
}
