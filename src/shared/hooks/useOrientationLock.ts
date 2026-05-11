import { useEffect } from 'react';

/**
 * Hook to lock the device orientation to portrait mode if the browser supports it.
 * This is primarily intended for mobile devices.
 */
export const useOrientationLock = () => {
  useEffect(() => {
    // Lock orientation if supported
    const orientation = (screen as unknown as { orientation?: { lock?: (o: string) => Promise<void> } }).orientation;
    if (orientation?.lock) {
      orientation.lock('portrait').catch(() => {
        // Silently ignore failures (e.g. on desktop or if not supported)
      });
    }
  }, []);
};
