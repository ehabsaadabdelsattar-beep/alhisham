import { useTranslation } from 'react-i18next';
import { partners } from '../../data';

export default function PartnersSection() {
  const { t } = useTranslation();
  // Duplicate for seamless marquee
  const doubled = [...partners, ...partners];

  return (
    <section className="py-16 bg-surface dark:bg-dark-200 border-y border-gray-100 dark:border-dark-300">
      <div className="container-custom mb-10 text-center">
        <p className="section-subtitle">{t('partners.subtitle')}</p>
        <h2 className="text-2xl font-bold text-dark dark:text-white">{t('partners.title')}</h2>
      </div>
      {/* Marquee */}
      <div className="marquee-container">
        <div className="marquee-track">
          {doubled.map((partner, i) => (
            <div
              key={i}
              className="flex items-center justify-center flex-shrink-0 px-8 py-4 bg-white dark:bg-dark-300 border border-gray-100 dark:border-dark-400 hover:border-gold hover:shadow-gold transition-all duration-300 min-w-[180px] h-20"
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
