import { useEffect } from 'react';

/**
 * Hook to lock the device orientation to portrait mode if the browser supports it.
 * This is primarily intended for mobile devices.
 */
export const useOrientationLock = () => {
  useEffect(() => {
    // Lock orientation if supported
    const screenAny = screen as any;
    if (screenAny && screenAny.orientation && screenAny.orientation.lock) {
      screenAny.orientation.lock('portrait').catch(() => {
        // Silently ignore failures (e.g. on desktop or if not supported)
      });
    }
  }, []);
};
