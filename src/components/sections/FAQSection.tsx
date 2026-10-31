import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function FAQSection() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = t('faq.items', { returnObjects: true }) as any[];

  return (
    <section className="section-padding bg-white dark:bg-dark-100">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div>
            <p className="section-subtitle">{t('faq.subtitle')}</p>
            <h2 className="section-title text-dark dark:text-white mb-4">{t('faq.title')}</h2>
            <div className="gold-divider" />
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mt-6 mb-8">
              لم تجد إجابة على سؤالك؟ فريقنا مستعد لمساعدتك في أي وقت. تواصل معنا عبر واتساب أو ملء نموذج التواصل.
            </p>
            <a
              href="https://wa.me/201103657888"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              تواصل معنا
            </a>
          </div>

          {/* Right: One Green Way Architectural Accordion */}
          <div className="accordion-css">
            <ul className="accordion-css__list">
              {faqs.map((faq: any, i: number) => {
                const isOpen = openIndex === i;
                return (
                  <li key={i} className="accordion-css__item">
                    <div
                      className="accordion-css__item-top"
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      role="button"
                      tabIndex={0}
                    >
                      <h3 className={`accordion-css__item-h3 ${isOpen ? '!text-gold' : ''}`}>
                        {faq.q}
                      </h3>
                      <div className={`accordion-css__item-icon ${isOpen ? 'is-active' : ''}`}>
                        <svg className="w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </div>
                    <div className={`accordion-css__item-bottom ${isOpen ? 'is-open' : ''}`}>
                      <div className="accordion-css__item-bottom-wrap">
                        <div className="accordion-css__item-bottom-content">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
