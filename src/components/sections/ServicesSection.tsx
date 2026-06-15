import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const serviceIcons: Record<string, React.ReactNode> = {
  building: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  clipboard: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  chart: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  design: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  megaphone: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  key: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ),
};

const bgColors = [
  'from-primary/5 to-primary/10',
  'from-gold/5 to-gold/10',
  'from-blue-500/5 to-blue-500/10',
  'from-purple-500/5 to-purple-500/10',
  'from-emerald-500/5 to-emerald-500/10',
  'from-orange-500/5 to-orange-500/10',
];

export default function ServicesSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const services = t('services.items', { returnObjects: true }) as any[];

  return (
    <section id="services" ref={ref} className="section-padding bg-surface dark:bg-dark-200">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="section-subtitle">{t('services.subtitle')}</p>
          <h2 className="section-title text-dark dark:text-white mb-4">{t('services.title')}</h2>
          <div className="gold-divider mx-auto" />
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service: any, i: number) => (
            <div
              key={service.id}
              style={{ transitionDelay: `${i * 100}ms` }}
              className={`group relative bg-white dark:bg-dark-300 p-8 hover:shadow-luxury transition-all duration-500 hover:-translate-y-2 border border-transparent hover:border-gold/20 overflow-hidden cursor-default ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${bgColors[i]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Gold corner accent */}
              <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-0 h-0 border-t-[60px] border-r-[60px] rtl:border-r-0 rtl:border-l-[60px] border-t-gold/10 border-r-transparent rtl:border-l-transparent group-hover:border-t-gold/20 transition-colors duration-300" />

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-16 h-16 bg-primary/10 group-hover:bg-primary group-hover:text-white text-primary dark:text-gold dark:bg-gold/10 flex items-center justify-center mb-6 transition-all duration-300">
                  {serviceIcons[service.icon]}
                </div>

                <h3 className="text-xl font-bold text-dark dark:text-white mb-3 group-hover:text-primary dark:group-hover:text-gold transition-colors duration-300">
                  {service.title}
                </h3>
                <div className="w-8 h-0.5 bg-gold mb-4 group-hover:w-12 transition-all duration-300" />
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  {service.description}
                </p>

                {/* Arrow */}
                <div className="mt-6 flex items-center gap-2 text-primary dark:text-gold text-sm font-medium opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <span>اعرف أكثر</span>
                  <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
