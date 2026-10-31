import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import BrandLogo from './BrandLogo';

export default function PageCurtainTransition() {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const isNavigatingRef = useRef<boolean>(false);

  // Helper to safely control smooth scroll
  const getLenis = () => {
    return (window as unknown as { __lenis?: { stop: () => void; start: () => void; scrollTo?: (target: number, opts?: { immediate: boolean }) => void } }).__lenis;
  };

  // 1. Initial Page Load Animation (matching $(document).ready from onegreenway.pt)
  useEffect(() => {
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    const logo = logoRef.current;

    if (!container || !wrapper || !logo) return;

    // If on homepage on initial mount, defer to home-loader aperture sequence
    if (window.location.pathname === '/' || location.pathname === '/') {
      container.style.display = 'none';
      return;
    }

    // Start with curtain fully covering the viewport
    container.style.display = 'block';
    container.style.pointerEvents = 'none';
    wrapper.style.alignItems = 'flex-end';

    // Animate the page transition bars to 0% height on page load
    gsap.to('.page-transition-bar', {
      height: '0%',
      duration: 1.1,
      ease: 'power2.inOut',
      stagger: 0.08,
      delay: 0.2,
    });

    gsap.to(logo, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut',
      delay: 0.2,
    });

    const timeout = setTimeout(() => {
      container.style.display = 'none';
      wrapper.style.alignItems = 'flex-start';
      getLenis()?.start();
    }, 1400);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  // 2. Intercept internal anchor clicks to play curtain transition before navigation
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      // Find the closest anchor element
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a') as HTMLAnchorElement | null;

      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const hasNoTransition =
        anchor.hasAttribute('no-transition') ||
        anchor.getAttribute('data-no-transition') === 'true';

      // Check if link is valid, internal, and does NOT have [no-transition] attribute
      if (
        !href ||
        href === '#' ||
        href.startsWith('#') ||
        hasNoTransition ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        anchor.target === '_blank' ||
        anchor.hostname !== window.location.hostname
      ) {
        return;
      }

      // Skip transition if navigating inside admin dashboard to preserve rapid productivity
      if (href.startsWith('/admin') && location.pathname.startsWith('/admin')) {
        return;
      }

      // Check if clicking current path
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl || href === window.location.pathname) {
        return;
      }

      if (isNavigatingRef.current) return;

      // Prevent immediate standard navigation to animate first
      event.preventDefault();
      event.stopPropagation();
      isNavigatingRef.current = true;

      const lenis = getLenis();
      lenis?.stop();

      const container = containerRef.current;
      const wrapper = wrapperRef.current;
      const logo = logoRef.current;

      if (!container || !wrapper || !logo) {
        navigate(href);
        isNavigatingRef.current = false;
        return;
      }

      // Display transition container and set upward orientation
      container.style.display = 'block';
      container.style.pointerEvents = 'auto';
      wrapper.style.alignItems = 'flex-start';

      // Check if pointing to the homepage
      const isHomepage =
        href === '/' ||
        href === window.location.origin ||
        href === window.location.origin + '/';

      const tl = gsap.timeline({
        onComplete: () => {
          // Navigate to new route via React Router
          navigate(href);

          // Scroll immediately to top on new page
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          const lenisNow = getLenis();
          if (lenisNow && typeof lenisNow.scrollTo === 'function') {
            lenisNow.scrollTo(0, { immediate: true });
          }

          // Prepare bars for unveiling the new page:
          // Switch alignment to flex-end so bars pull away downwards smoothly
          wrapper.style.alignItems = 'flex-end';

          const exitTl = gsap.timeline({
            onComplete: () => {
              container.style.display = 'none';
              container.style.pointerEvents = 'none';
              wrapper.style.alignItems = 'flex-start';
              isNavigatingRef.current = false;
              
              // Ensure we are definitely at the top when the curtain fully lifts
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              document.documentElement.scrollTop = 0;
              document.body.scrollTop = 0;
              const activeLenis = getLenis();
              if (activeLenis && typeof activeLenis.scrollTo === 'function') {
                activeLenis.scrollTo(0, { immediate: true });
              }
              activeLenis?.start();
            },
          });

          exitTl
            .to('.page-transition-bar', {
              height: '0%',
              duration: 0.9,
              ease: 'power2.inOut',
              stagger: 0.08,
            })
            .to(
              logo,
              {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.inOut',
              },
              '-=0.7'
            );
        },
      });

      if (isHomepage) {
        tl.to('.page-transition-bar', {
          height: '100%',
          duration: 0.9,
          ease: 'power2.inOut',
          stagger: 0.08,
        })
          .to(
            logo,
            {
              opacity: 1,
              duration: 0.55,
              ease: 'power2.inOut',
            },
            '-=0.75'
          )
          .to(logo, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.inOut',
          });
      } else {
        tl.to('.page-transition-bar', {
          height: '100%',
          duration: 0.9,
          ease: 'power2.inOut',
          stagger: 0.08,
        }).to(
          logo,
          {
            opacity: 1,
            duration: 0.55,
            ease: 'power2.inOut',
          },
          '-=0.75'
        );
      }
    };

    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [location.pathname, navigate]);

  return (
    <div
      ref={containerRef}
      className="section_page-transition fixed inset-0 z-[99999] pointer-events-none overflow-hidden"
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* 5 Vertical Architectural Emerald Curtain Columns */}
      <div
        ref={wrapperRef}
        className="page-transition-bars_wrapper absolute inset-0 flex flex-row w-full h-full pointer-events-none"
        style={{ alignItems: 'flex-end' }}
      >
        {/* Column 1 */}
        <div className="page-transition-bar flex-1 h-full bg-[#103C32] border-r border-[#C6A45B]/15 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#185346]/20 via-transparent to-black/20" />
        </div>

        {/* Column 2 */}
        <div className="page-transition-bar flex-1 h-full bg-[#0D332B] border-r border-[#C6A45B]/15 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#185346]/20 via-transparent to-black/20" />
        </div>

        {/* Column 3 (Center) */}
        <div className="page-transition-bar flex-1 h-full bg-[#103C32] border-r border-[#C6A45B]/15 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#185346]/20 via-transparent to-black/20" />
        </div>

        {/* Column 4 */}
        <div className="page-transition-bar flex-1 h-full bg-[#0D332B] border-r border-[#C6A45B]/15 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#185346]/20 via-transparent to-black/20" />
        </div>

        {/* Column 5 */}
        <div className="page-transition-bar flex-1 h-full bg-[#103C32] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#185346]/20 via-transparent to-black/20" />
        </div>
      </div>

      {/* Luxury White Architectural Emblem & Typography in Center (Matching Toolbar Logo) */}
      <div
        ref={logoRef}
        className="logo-transition absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 select-none px-6"
        style={{ opacity: 1 }}
      >
        {/* Ambient subtle radial glow */}
        <div className="absolute w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center text-center">
          <BrandLogo variant="horizontal" theme="white" size="xl" />
        </div>
      </div>
    </div>
  );
}
