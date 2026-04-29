import { useEffect, RefObject } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to automatically scroll a target element to the top on route changes.
 * @param mainContentRef Reference to the scrollable container.
 */
export const useScrollToTop = (mainContentRef: RefObject<HTMLElement | null>) => {
  const location = useLocation();

  useEffect(() => {
    const mainEl = mainContentRef.current;
    if (!mainEl) return;
    
    mainEl.scrollTo({ 
      top: 0, 
      behavior: 'instant' 
    });
  }, [location.pathname, mainContentRef]);
};
