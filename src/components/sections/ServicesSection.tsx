import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLang } from '../../context/LanguageContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const serviceIcons: Record<string, React.ReactNode> = {
  building: (
    <svg className="w-7 h-7 text-emerald dark:text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  clipboard: (
    <svg className="w-7 h-7 text-emerald dark:text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  chart: (
    <svg className="w-7 h-7 text-emerald dark:text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  design: (
    <svg className="w-7 h-7 text-emerald dark:text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  megaphone: (
    <svg className="w-7 h-7 text-emerald dark:text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  key: (
    <svg className="w-7 h-7 text-emerald dark:text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ),
};

export default function ServicesSection() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const services = (t('services.items', { returnObjects: true }) as Array<{ id?: string; icon: string; title: string; description: string }>) || [];

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // 1. Header Reveal
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }

      // 2. Staggered Service Cards Reveal
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll('.service-card-item');
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 82%',
              once: true,
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, [services]);

  return (
    <section ref={sectionRef} id="services" className="section-padding bg-ivory dark:bg-forest-dark border-t border-beige/60 dark:border-white/10 relative">
      <div className="container-custom">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16 max-w-2xl mx-auto">
          <div className="section-subtitle justify-center">
            <span className="w-6 h-px bg-emerald dark:bg-gold" />
            {t('services.subtitle')}
            <span className="w-6 h-px bg-emerald dark:bg-gold" />
          </div>
          <h2 className="section-title text-forest dark:text-white mb-4 font-sans">
            {t('services.title')}
          </h2>
          <div className="gold-divider mx-auto" />
        </div>

        {/* Minimal Architectural Grid with 16px Rounded Cards (GSAP Staggered) */}
        <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <div
              key={service.id || i}
              className="service-card-item group p-8 bg-white dark:bg-forest/50 border border-beige/70 dark:border-white/10 hover:border-emerald/40 dark:hover:border-gold/40 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 relative flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-xl bg-emerald/10 dark:bg-gold/15 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105 border border-emerald/20 dark:border-gold/30">
                  {serviceIcons[service.icon] || serviceIcons.building}
                </div>
                <h3 className="text-xl font-bold text-forest dark:text-white mb-3 group-hover:text-emerald dark:group-hover:text-gold transition-colors font-sans">
                  {service.title}
                </h3>
                <p className="text-textSecondary dark:text-gray-300 text-xs sm:text-sm leading-relaxed font-light font-sans">
                  {service.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-beige/50 dark:border-white/10 flex items-center justify-between">
                <span className="text-sm font-editorial italic font-bold text-gold">
                  0{i + 1}
                </span>
                <Link
                  to="/contact"
                  className="text-xs font-semibold text-emerald dark:text-gold group-hover:underline transition-all flex items-center gap-1.5"
                >
                  <span>{lang === 'ar' ? 'استفسر الآن' : 'Learn More'}</span>
                  <span className="rtl:rotate-180">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
