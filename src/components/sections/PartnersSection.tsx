import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { partners } from '../../data';

export default function PartnersSection() {
  const { t } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);

  // Duplicate for seamless 50% infinite marquee loop
  const doubled = [...partners, ...partners];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const ctx = gsap.context(() => {
      const tlmar = gsap.timeline({ repeat: -1 });

      tlmar.fromTo(
        track,
        {
          xPercent: 0,
        },
        {
          xPercent: -50,
          duration: 35,
          ease: 'none',
        }
      );

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
  }, []);

  return (
    <section className="py-16 bg-surface dark:bg-dark-200 border-y border-gray-100 dark:border-dark-300 overflow-hidden">
      <div className="container-custom mb-10 text-center">
        <p className="section-subtitle">{t('partners.subtitle')}</p>
        <h2 className="text-2xl font-bold text-dark dark:text-white font-sans">{t('partners.title')}</h2>
      </div>

      {/* Marquee Container */}
      <div className="marquee_container marquee-container w-full overflow-hidden select-none">
        <div
          ref={trackRef}
          className="marquee_track marquee-track flex items-center gap-6 will-change-transform cursor-pointer"
        >
          {doubled.map((partner, i) => (
            <div
              key={i}
              className="flex items-center justify-center flex-shrink-0 px-8 py-4 bg-white dark:bg-dark-300 border border-gray-100 dark:border-dark-400 hover:border-gold hover:shadow-gold rounded-xl transition-all duration-300 min-w-[180px] h-20"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                loading="lazy"
                className="h-10 w-auto object-contain filter dark:brightness-0 dark:invert opacity-60 hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
