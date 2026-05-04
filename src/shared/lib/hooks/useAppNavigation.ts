import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Hook to manage app-wide navigation logic.
 * Handles custom back button behavior.
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // If there is history, go back
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
      return;
    }

    // Default fallbacks based on current path
    const path = location.pathname;
    if (path.startsWith('/catalog/')) {
      navigate('/catalog', { replace: true });
    } else if (path === '/notifications') {
      navigate('/catalog', { replace: true });
    } else if (path.startsWith('/notifications/')) {
      navigate('/notifications', { replace: true });
    } else if (path === '/settings') {
      navigate('/catalog', { replace: true });
    } else if (path.startsWith('/settings/')) {
      navigate('/settings', { replace: true });
    } else {
      navigate('/catalog', { replace: true });
    }
  };

  return {
    handleBack,
  };
};
