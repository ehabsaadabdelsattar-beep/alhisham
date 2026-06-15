import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLang } from '../../context/LanguageContext';

export default function AboutSection() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const values = (t('about.values', { returnObjects: true }) as string[]);

  return (
    <section ref={ref} className="section-padding bg-white dark:bg-dark-100 overflow-hidden">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Image Stack */}
          <div className={`relative transition-all duration-1000 ${visible ? 'opacity-100 translate-x-0' : (lang === 'ar' ? 'opacity-0 translate-x-20' : 'opacity-0 -translate-x-20')}`}>
            {/* Main image */}
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=700&q=80"
                alt="About AL HISHAM"
                loading="lazy"
                className="w-full h-[500px] object-cover shadow-luxury"
              />
            </div>
            {/* Accent image */}
            <div className="absolute -bottom-8 -right-8 rtl:-left-8 rtl:right-auto w-48 h-48 z-20 border-4 border-white dark:border-dark-100 shadow-luxury overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=300&q=80"
                alt="About accent"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Gold decorative frame */}
            <div className="absolute -top-4 -left-4 rtl:-right-4 rtl:left-auto w-32 h-32 border-l-2 border-t-2 border-gold z-0" />
            <div className="absolute -bottom-4 -right-4 rtl:-left-4 rtl:right-auto w-32 h-32 border-r-2 border-b-2 border-gold z-30" />
            {/* Stat badge */}
            <div className="absolute top-8 -right-6 rtl:-left-6 rtl:right-auto z-20 bg-primary text-white px-5 py-4 shadow-green text-center">
              <div className="text-3xl font-bold font-english">15+</div>
              <div className="text-xs text-primary-lighter leading-tight mt-1">{t('stats.years')}</div>
            </div>
          </div>

          {/* Right: Content */}
          <div className={`transition-all duration-1000 delay-200 ${visible ? 'opacity-100 translate-x-0' : (lang === 'ar' ? 'opacity-0 -translate-x-20' : 'opacity-0 translate-x-20')}`}>
            <p className="section-subtitle">{t('about.subtitle')}</p>
            <h2 className="section-title text-dark dark:text-white mb-4">{t('about.title')}</h2>
            <div className="gold-divider" />
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg mb-8">
              {t('about.description')}
            </p>

            {/* Vision & Mission */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-surface dark:bg-dark-200 p-5 border-t-2 border-primary">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h4 className="font-bold text-dark dark:text-white mb-2">{t('about.vision_title')}</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{t('about.vision_text')}</p>
              </div>
              <div className="bg-surface dark:bg-dark-200 p-5 border-t-2 border-gold">
                <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h4 className="font-bold text-dark dark:text-white mb-2">{t('about.mission_title')}</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{t('about.mission_text')}</p>
              </div>
            </div>

            {/* Values */}
            <div>
              <h4 className="font-bold text-dark dark:text-white mb-4">{t('about.values_title')}</h4>
              <div className="flex flex-wrap gap-2">
                {values.map((val) => (
                  <span
                    key={val}
                    className="px-4 py-2 border border-primary/30 text-primary dark:text-gold text-sm font-medium hover:bg-primary hover:text-white transition-all duration-200 cursor-default"
                  >
                    {val}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
