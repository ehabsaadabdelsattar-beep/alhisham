import React from 'react';
import SEO from '../components/ui/SEO';
import { useTranslation } from 'react-i18next';
import { useLang } from '../context/LanguageContext';
import AboutSection from '../components/sections/AboutSection';
import PartnersSection from '../components/sections/PartnersSection';

export default function About() {
  const { t } = useTranslation();
  const { lang } = useLang();

  return (
    <>
      <SEO 
        title={t('nav.about')} 
        description="تعرف على شركة الهشام للتطوير العقاري ورؤيتنا في بناء مستقبل عقاري مستدام." 
      />

      {/* Page Hero */}
      <div className="relative pt-32 pb-20 bg-dark overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/80 to-dark" />
        <div className="container-custom relative z-10 text-center">
          <p className="section-subtitle">{t('about.subtitle')}</p>
          <h1 className="text-5xl font-bold text-white mb-4">{t('about.title')}</h1>
          <div className="gold-divider mx-auto" />
        </div>
      </div>

      <AboutSection />

      {/* Stats Banner */}
      <section className="bg-primary py-16">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10 rtl:divide-x-reverse">
            {[
              { num: '15+', label: t('stats.years') },
              { num: '87+', label: t('stats.projects') },
              { num: '1240+', label: t('stats.clients') },
              { num: '850K+', label: t('stats.sqm') },
            ].map((stat, i) => (
              <div key={i} className="text-center px-4">
                <div className="text-4xl md:text-5xl font-bold text-gold mb-2 font-english">{stat.num}</div>
                <div className="text-white/80 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CEO Message */}
      <section className="section-padding bg-surface dark:bg-dark-200">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto bg-white dark:bg-dark-300 p-8 md:p-12 shadow-luxury flex flex-col md:flex-row gap-8 items-center">
            <div className="w-48 h-48 rounded-full overflow-hidden flex-shrink-0 border-4 border-gold">
              <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80" alt="CEO" className="w-full h-full object-cover" />
            </div>
            <div>
              <svg className="w-10 h-10 text-gold/30 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl leading-relaxed italic mb-6">
                {lang === 'ar'
                  ? 'نسعى دائماً لتقديم مشاريع عقارية تتجاوز توقعات عملائنا، من خلال التزامنا الراسخ بالجودة والابتكار. نحن لا نبني مجرد مبانٍ، بل نصنع بيئات حياة متكاملة تستمر للأجيال.'
                  : 'We always strive to deliver real estate projects that exceed our clients\' expectations, through our steadfast commitment to quality and innovation. We don\'t just build buildings, we create integrated living environments that last for generations.'}
              </p>
              <h4 className="font-bold text-dark dark:text-white text-lg">
                {lang === 'ar' ? 'المهندس / هشام العقاري' : 'Eng. Hisham Al-Aqari'}
              </h4>
              <p className="text-gold text-sm">
                {lang === 'ar' ? 'الرئيس التنفيذي' : 'Chief Executive Officer'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <PartnersSection />
    </>
  );
}
