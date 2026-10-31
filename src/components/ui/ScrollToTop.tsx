import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures scroll position is immediately and reliably reset to (0, 0) on every
 * page navigation and page load, seamlessly coordinating with Lenis smooth scroll
 * and React Router transitions.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // Disable automatic browser scroll restoration on reload
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const resetScroll = () => {
      if (hash) {
        const el = document.getElementById(hash.replace('#', ''));
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      const lenis = (window as unknown as { __lenis?: { scrollTo: (target: number, opts: { immediate: boolean }) => void } }).__lenis;
      if (lenis && typeof lenis.scrollTo === 'function') {
        lenis.scrollTo(0, { immediate: true });
      }
    };

    // 1. Immediately reset scroll position
    resetScroll();

    // 2. Double requestAnimationFrame to catch browser layout paint cycles
    const raf1 = requestAnimationFrame(resetScroll);
    const raf2 = requestAnimationFrame(() => requestAnimationFrame(resetScroll));

    // 3. Staggered timeouts to catch AnimatePresence route exit/enter and Suspense mounts
    const t1 = setTimeout(resetScroll, 50);
    const t2 = setTimeout(resetScroll, 150);
    const t3 = setTimeout(resetScroll, 300);
    const t4 = setTimeout(resetScroll, 450);
    const t5 = setTimeout(resetScroll, 600);

    const handleBeforeUnload = () => {
      resetScroll();
      const lenis = (window as unknown as { __lenis?: { stop: () => void } }).__lenis;
      lenis?.stop();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname, search, hash]);

  return null;
}

