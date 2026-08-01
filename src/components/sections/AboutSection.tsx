import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLang } from '../../context/LanguageContext';
import { motion } from 'framer-motion';

export default function AboutSection() {
  const { t } = useTranslation();
  const { lang, isRTL } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const values = (t('about.values', { returnObjects: true }) as string[]) || [];

  return (
    <section ref={ref} className="section-padding bg-white dark:bg-black overflow-hidden relative">
      <div className="container-custom">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Editorial Architectural Images (7 Cols) */}
          <div className="lg:col-span-7 relative">
            <div className="relative z-10 overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80"
                alt="AL HISHAM Architecture"
                loading="lazy"
                className="w-full h-[460px] sm:h-[540px] object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-6 bg-black/80 backdrop-blur-md border border-gold/20 flex items-center justify-between">
                <div>
                  <p className="text-gold text-xs font-bold uppercase tracking-widest">{t('about.subtitle')}</p>
                  <p className="text-white text-lg font-bold mt-1">{lang === 'ar' ? 'الهشام للتطوير العقاري' : 'Al Hisham Development'}</p>
                </div>
                <div className="text-right font-english">
                  <span className="text-3xl font-bold text-gradient-gold">15+</span>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">{t('stats.years')}</p>
                </div>
              </div>
            </div>

            {/* Subtle Gold Frame Lines */}
            <div className="absolute -top-4 -left-4 w-32 h-32 border-l-2 border-t-2 border-gold/40 z-0 hidden sm:block" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border-r-2 border-b-2 border-gold/40 z-0 hidden sm:block" />
          </div>

          {/* Right Column: Editorial Typography & Vision (5 Cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="section-subtitle">{t('about.subtitle')}</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-dark dark:text-white leading-[1.2] mb-4">
                {lang === 'ar' ? 'نبني أكثر من مجرد عقارات... نبني قيمة تدوم.' : 'Building Beyond Structures... Creating Enduring Value.'}
              </h2>
              <div className="gold-divider" />
            </div>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base font-light">
              {t('about.description')}
            </p>

            {/* Vision & Mission Cards */}
            <div className="space-y-4 pt-2">
              <div className="p-5 bg-surface dark:bg-dark-100 border-l-4 border-gold dark:border-gold">
                <h4 className="font-bold text-dark dark:text-white mb-1 text-sm uppercase tracking-wider">{t('about.vision_title')}</h4>
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{t('about.vision_text')}</p>
              </div>

              <div className="p-5 bg-surface dark:bg-dark-100 border-l-4 border-dark dark:border-white">
                <h4 className="font-bold text-dark dark:text-white mb-1 text-sm uppercase tracking-wider">{t('about.mission_title')}</h4>
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{t('about.mission_text')}</p>
              </div>
            </div>

            {/* Brand Values */}
            {values.length > 0 && (
              <div className="pt-2">
                <h4 className="font-bold text-dark dark:text-white text-xs uppercase tracking-widest mb-3">{t('about.values_title')}</h4>
                <div className="flex flex-wrap gap-2">
                  {values.map((val) => (
                    <span
                      key={val}
                      className="px-3.5 py-1.5 border border-gold/30 text-gold text-xs font-semibold uppercase tracking-wider bg-gold/5"
                    >
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
