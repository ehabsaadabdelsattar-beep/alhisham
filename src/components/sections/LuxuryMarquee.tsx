import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useLang } from '../../context/LanguageContext';

interface LuxuryMarqueeProps {
  theme?: 'ivory' | 'forest' | 'emerald';
  speed?: number; // duration in seconds for full 50% loop, default 50
  reverse?: boolean;
}

export default function LuxuryMarquee({
  theme = 'forest',
  speed = 50,
  reverse = false,
}: LuxuryMarqueeProps) {
  const { lang, isRTL } = useLang();
  const trackRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const marqueeItems = [
    { ar: 'تصاميم معمارية أيقونية', en: 'ICONIC ARCHITECTURAL DESIGNS' },
    { ar: 'مواقع استراتيجية استثنائية', en: 'PRIME STRATEGIC LOCATIONS' },
    { ar: 'تشطيبات فندقية فائقة الجودة', en: 'ULTRA-LUXURY FINISHES' },
    { ar: 'عوائد استثمارية تصاعدية', en: 'HIGH CAPITAL APPRECIATION' },
    { ar: 'التزام صارم بمواعيد التسليم', en: 'PRECISION TIMELY DELIVERY' },
    { ar: 'مساحات خضراء ومرافق حصرية', en: 'PRIVATE EXCLUSIVE AMENITIES' },
    { ar: 'معايير بناء عالمية مستدامة', en: 'SUSTAINABLE SMART LIVING' },
    { ar: 'إدارة أصول احترافية 24/7', en: '24/7 ASSET MANAGEMENT' },
  ];

  // Exact 2 halves for mathematically seamless 50% translation loop
  const doubledItems = [...marqueeItems, ...marqueeItems];

  const themeStyles = {
    forest: 'bg-forest text-ivory border-y border-white/10',
    emerald: 'bg-emerald text-white border-y border-gold/30',
    ivory: 'bg-ivory text-forest border-y border-beige/60',
  };

  // One Green Way GSAP Continuous Marquee Timeline Implementation
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const ctx = gsap.context(() => {
      // Create infinite repeating timeline
      const tlmar = gsap.timeline({ repeat: -1 });
      timelineRef.current = tlmar;

      // In LTR or default: moves from 0 to -50%
      // Direction can adapt to RTL or custom reverse
      const targetPercent = reverse ? 50 : -50;
      const startPercent = 0;

      tlmar.fromTo(
        track,
        {
          xPercent: startPercent,
        },
        {
          xPercent: targetPercent,
          duration: speed,
          ease: 'none',
        }
      );

      // Smooth pause and resume on hover
      const onEnter = () => tlmar.pause();
      const onLeave = () => tlmar.resume();

      track.addEventListener('mouseenter', onEnter);
      track.addEventListener('mouseleave', onLeave);

      return () => {
        track.removeEventListener('mouseenter', onEnter);
        track.removeEventListener('mouseleave', onLeave);
      };
    }, track);

    return () => ctx.revert();
  }, [speed, reverse, isRTL]);

  return (
    <div
      className={`relative w-full py-4 sm:py-5 overflow-hidden select-none ${themeStyles[theme]}`}
      aria-label="Brand Highlights Marquee"
    >
      {/* Edge vignette gradients for subtle seamless entry/exit */}
      <div className="absolute top-0 left-0 w-24 sm:w-32 h-full bg-gradient-to-r from-forest via-forest/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-24 sm:w-32 h-full bg-gradient-to-l from-forest via-forest/80 to-transparent z-10 pointer-events-none" />

      {/* Marquee Track Container */}
      <div className="marquee_container marquee-container w-full overflow-hidden">
        <div
          ref={trackRef}
          className="marquee_track marquee-track flex items-center gap-8 will-change-transform cursor-pointer"
        >
          {doubledItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-8 flex-shrink-0">
              <span className="text-xs sm:text-sm font-medium tracking-[0.18em] uppercase font-sans whitespace-nowrap">
                {lang === 'ar' ? item.ar : item.en}
              </span>
              <span className="text-gold text-xs sm:text-sm select-none opacity-80">❖</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Standalone initializer matching the exact snippet:
 * document.addEventListener("DOMContentLoaded", function () {
 *   let tlmar = gsap.timeline({ repeat: -1 });
 *   tlmar.fromTo(".marquee_track", { xPercent: 0 }, { xPercent: -50, duration: 50, ease: "none" });
 * });
 */
export function initMarqueeAnimations() {
  if (typeof document === 'undefined') return;

  const tracks = document.querySelectorAll<HTMLElement>('.marquee_track');
  if (!tracks.length) return;

  tracks.forEach((track) => {
    if ((track as unknown as { _marqueeInit?: boolean })._marqueeInit) return;
    (track as unknown as { _marqueeInit?: boolean })._marqueeInit = true;

    const tlmar = gsap.timeline({ repeat: -1 });
    tlmar.fromTo(
      track,
      { xPercent: 0 },
      {
        xPercent: -50,
        duration: 50,
        ease: 'none',
      }
    );
  });
}
