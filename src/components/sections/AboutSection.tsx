import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLang } from '../../context/LanguageContext';
import ParallaxImage from '../ui/ParallaxImage';
import EditorialText from '../ui/EditorialText';

export default function AboutSection() {
  const { t } = useTranslation();
  const { lang, isRTL } = useLang();

  // Dispatch custom event aboutFlipLoaded as on onegreenway.pt
  useEffect(() => {
    document.dispatchEvent(new CustomEvent('aboutFlipLoaded'));
  }, []);

  const values = (t('about.values', { returnObjects: true }) as string[]) || [];

  return (
    <section className="section-padding bg-ivory dark:bg-forest-dark overflow-hidden relative">
      <div className="container-custom">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Editorial Architectural Images (7 Cols) */}
          <div className="lg:col-span-7 relative">
            <ParallaxImage
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80"
              alt="AL HISHAM Architecture"
              className="relative z-10 rounded-2xl shadow-xl border border-beige/60 dark:border-white/10 h-[460px] sm:h-[540px]"
              speed={10}
              overlay={<div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/20 to-transparent pointer-events-none" />}
            >
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-xl bg-forest/90 text-ivory backdrop-blur-xl border border-gold/30 flex items-center justify-between shadow-2xl pointer-events-auto">
                <div>
                  <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-gold" />
                    <span>{t('about.subtitle')}</span>
                  </div>
                  <p className="text-white text-lg font-bold mt-1 font-sans">
                    {lang === 'ar' ? 'الهشام للتطوير العقاري' : 'Al Hisham Developments'}
                  </p>
                </div>
                <div className={`font-english ${isRTL ? 'text-left' : 'text-right'}`}>
                  <span className="text-3xl sm:text-4xl font-bold text-gold font-sans">15+</span>
                  <p className="text-[10px] text-gray-300 uppercase tracking-widest">{t('stats.years')}</p>
                </div>
              </div>
            </ParallaxImage>

            {/* Architectural Accent Borders */}
            <div className="absolute -top-3 -left-3 w-28 h-28 border-l-2 border-t-2 border-gold/40 rounded-tl-2xl z-0 hidden sm:block" />
            <div className="absolute -bottom-3 -right-3 w-28 h-28 border-r-2 border-b-2 border-emerald/40 rounded-br-2xl z-0 hidden sm:block" />
          </div>

          {/* Right Column: Editorial Typography & Vision (5 Cols) */}
          <div className="lg:col-span-5 space-y-7">
            <div>
              <div className="section-subtitle">
                <span className="w-6 h-px bg-emerald dark:bg-gold" />
                {t('about.subtitle')}
              </div>
              <EditorialText
                as="h2"
                animation="word-title"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-forest dark:text-white leading-[1.18] mb-4 font-sans"
              >
                {lang === 'ar'
                  ? 'نبني أكثر من مجرد عقارات... نبني قيمة تدوم'
                  : 'Building Beyond Structures... Creating Enduring Value'}
              </EditorialText>
              <div className="gold-divider" />
            </div>

            <EditorialText
              as="p"
              animation="letter-opacity"
              className="text-textSecondary dark:text-gray-300 leading-relaxed text-sm sm:text-base font-light font-sans"
            >
              {t('about.description')}
            </EditorialText>

            {/* Vision & Mission Cards - 14px rounded */}
            <div className="space-y-4 pt-1">
              <div className="p-5 rounded-xl bg-white dark:bg-forest/60 border border-beige/70 dark:border-white/10 border-s-4 border-s-emerald shadow-sm">
                <h4 className="font-bold text-forest dark:text-white mb-1 text-sm uppercase tracking-wider font-sans">
                  {t('about.vision_title')}
                </h4>
                <p className="text-textSecondary dark:text-gray-300 text-xs leading-relaxed font-sans">
                  {t('about.vision_text')}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white dark:bg-forest/60 border border-beige/70 dark:border-white/10 border-s-4 border-s-gold shadow-sm">
                <h4 className="font-bold text-forest dark:text-white mb-1 text-sm uppercase tracking-wider font-sans">
                  {t('about.mission_title')}
                </h4>
                <p className="text-textSecondary dark:text-gray-300 text-xs leading-relaxed font-sans">
                  {t('about.mission_text')}
                </p>
              </div>
            </div>

            {/* Brand Values */}
            {values.length > 0 && (
              <div className="pt-2">
                <h4 className="font-bold text-forest dark:text-white text-xs uppercase tracking-widest mb-3 font-sans">
                  {t('about.values_title')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {values.map((val) => (
                    <span
                      key={val}
                      className="px-3.5 py-1.5 rounded-xl border border-emerald/20 dark:border-gold/30 text-emerald dark:text-gold text-xs font-semibold tracking-wider bg-emerald/5 dark:bg-gold/10 font-sans"
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
