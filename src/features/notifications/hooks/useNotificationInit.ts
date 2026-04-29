import { useEffect } from 'react';
import { useNotificationStore } from '@/entities/notification';

/**
 * Hook to initialize the notification subscription service.
 * Manages the connection to the notifications feed and cleanup on unmount.
 */
export const useNotificationInit = () => {
  const { init } = useNotificationStore(state => state.actions);

  useEffect(() => {
    const unsub = init();
    return () => unsub();
  }, [init]);
};
