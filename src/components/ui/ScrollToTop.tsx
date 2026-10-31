import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures scroll position is reset to top on navigation and refresh,
 * matching One Green Way:
 * window.onbeforeunload = function () {
 *   window.scrollTo(0, 0);
 *   lenis.stop();
 * };
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable automatic browser scroll restoration on reload
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Immediately reset window scroll position to the top
    window.scrollTo(0, 0);

    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
      const lenis = (window as unknown as { __lenis?: { stop: () => void } }).__lenis;
      lenis?.stop();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);

  return null;
}
