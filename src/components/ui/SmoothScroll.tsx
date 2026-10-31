import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP ScrollTrigger plugin globally
gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  const location = useLocation();

  useEffect(() => {
    // Disable smooth scroll on admin dashboard for maximum productivity and immediate response
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });

    // Synchronize Lenis scroll with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // Provide lenis and ScrollTrigger instances globally for scroll-to triggers if needed
    (window as unknown as { __lenis?: Lenis; lenis?: Lenis; ScrollTrigger?: typeof ScrollTrigger }).__lenis = lenis;
    (window as unknown as { __lenis?: Lenis; lenis?: Lenis; ScrollTrigger?: typeof ScrollTrigger }).lenis = lenis;
    (window as unknown as { ScrollTrigger?: typeof ScrollTrigger }).ScrollTrigger = ScrollTrigger;

    // Prevent browser from restoring scroll position on page refresh (One Green Way Spec)
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Go back to top on refresh and halt lenis
    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
      lenis.stop();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Refresh ScrollTrigger calculations after initial layout render
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimeout(timeout);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis; lenis?: Lenis }).__lenis;
      delete (window as unknown as { __lenis?: Lenis; lenis?: Lenis }).lenis;
    };
  }, [location.pathname]);

  return null;
}
