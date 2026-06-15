import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';

export default function FeaturesSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    {
      title: 'جودة التنفيذ',
      titleEn: 'Execution Quality',
      desc: 'نلتزم بأعلى معايير الجودة العالمية في البناء والتشطيبات، مع استخدام أفضل المواد لضمان استدامة مشاريعنا.',
      descEn: 'We adhere to the highest global quality standards in construction and finishing, using premium materials for sustainability.',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      title: 'الالتزام بالمواعيد',
      titleEn: 'Punctuality',
      desc: 'نضع وقت عملائنا في مقدمة أولوياتنا، ونتعهد بتسليم كافة الوحدات والمشاريع في المواعيد المتفق عليها بدقة.',
      descEn: 'We prioritize our clients\' time, committing to deliver all units and projects exactly on the agreed-upon schedules.',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'خبرة هندسية',
      titleEn: 'Engineering Expertise',
      desc: 'يضم فريقنا نخبة من المهندسين والاستشاريين ذوي الخبرة الطويلة لضمان دقة التصميم وقوة التنفيذ.',
      descEn: 'Our team comprises elite engineers and consultants with extensive experience to ensure design accuracy and execution strength.',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: 'استثمار آمن',
      titleEn: 'Secure Investment',
      desc: 'نوفر فرصاً استثمارية مدروسة تضمن تحقيق أعلى عوائد مالية آمنة ومستقرة في القطاع العقاري المتنامي.',
      descEn: 'We provide well-studied investment opportunities ensuring the highest safe and stable financial returns in the real estate sector.',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  return (
    <section ref={ref} className="section-padding bg-surface dark:bg-dark-100 overflow-hidden">
      <div className="container-custom relative">
        {/* Header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-gold/10 text-primary dark:text-gold text-xs font-semibold tracking-widest uppercase mb-4 rounded-full">
            <span className="w-2 h-2 rounded-full bg-primary dark:bg-gold animate-pulse" />
            {t('nav.about') || 'لماذا نحن؟'}
          </div>
          <h2 className="section-title text-dark dark:text-white">
            {t('nav.home') === 'الرئيسية' ? 'لماذا تختار الهشام للتطوير العقاري؟' : 'Why Choose Al Hisham Development?'}
          </h2>
          <div className="gold-divider mx-auto my-6" />
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative bg-white dark:bg-dark-200 rounded-sm p-8 premium-shadow dark:premium-shadow-dark border border-gray-100 dark:border-dark-300 hover:border-primary/50 dark:hover:border-gold/50 transition-all duration-500 overflow-hidden"
            >
              {/* Hover Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent dark:from-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Icon */}
              <div className="relative w-16 h-16 mb-6 rounded-2xl bg-surface dark:bg-dark-300 flex items-center justify-center text-primary dark:text-gold group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm">
                {feature.icon}
                <div className="absolute inset-0 border border-primary/20 dark:border-gold/20 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500" />
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-xl font-bold text-dark dark:text-white mb-3 group-hover:text-primary dark:group-hover:text-gold transition-colors">
                  {t('nav.home') === 'الرئيسية' ? feature.title : feature.titleEn}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  {t('nav.home') === 'الرئيسية' ? feature.desc : feature.descEn}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
