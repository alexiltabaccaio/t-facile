import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to manage presentation mode.
 * Persists in sessionStorage and checks for ?presentation=true in URL.
 */
export const usePresentationMode = () => {
  const location = useLocation();
  const [isPresentation, setIsPresentation] = useState(() => {
    return sessionStorage.getItem('isPresentation') === 'true' || 
           new URLSearchParams(window.location.search).get('presentation') === 'true';
  });

  useEffect(() => {
    if (new URLSearchParams(location.search).get('presentation') === 'true') {
      sessionStorage.setItem('isPresentation', 'true');
      setIsPresentation(true);
    }
  }, [location.search]);

  return isPresentation;
};
