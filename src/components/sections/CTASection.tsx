import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLang } from '../../context/LanguageContext';

const WHATSAPP = '201103657888';

export default function CTASection() {
  const { t } = useTranslation();
  const { lang } = useLang();

  const waMsg = encodeURIComponent(
    lang === 'ar'
      ? 'مرحباً، أود طلب استشارة عقارية مجانية من الهشام للتطوير العقاري'
      : 'Hello, I would like to request a free consultation from Al Hisham Real Estate Development'
  );

  const trustBadges = [
    lang === 'ar' ? 'مشاريع مرخصة ومعتمدة' : 'Verified Licensed Projects',
    lang === 'ar' ? 'أنظمة سداد استثمارية مرنة' : 'Flexible Payment Plans',
    lang === 'ar' ? 'استشارات هندسية مجانية' : 'Complimentary Engineering Advisory',
    lang === 'ar' ? 'ضمان الجودة والصيانة' : 'Guaranteed Quality Assurance',
  ];

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-black text-white border-t border-gold/20">
      {/* Background Architectural Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed opacity-30"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/60 z-0" />

      <div className="container-custom relative z-10 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="section-subtitle">
            {lang === 'ar' ? 'تواصل مع خبراء الهشام' : 'CONNECT WITH AL HISHAM EXPERTS'}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            {lang === 'ar' ? 'جاهز لاتخاذ الخطوة القادمة؟' : 'Ready to Take Your Next'}
            <br />
            <span className="text-gradient-gold">
              {lang === 'ar' ? 'احجز استشارتك العقارية الآن' : 'Real Estate Investment Step?'}
            </span>
          </h2>
          <div className="gold-divider mx-auto" />
          
          <p className="text-gray-300 text-base sm:text-lg font-light leading-relaxed max-w-xl mx-auto">
            {lang === 'ar'
              ? 'تواصل مع فريقنا المعماري والاستثماري اليوم للحصول على استشارة متخصصة تناسب أهدافك.'
              : 'Speak directly with our real estate development advisory team for personalized guidance.'}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
            <Link to="/contact" className="btn-gold !px-8 !py-4">
              <span>{t('cta.cta_consult')}</span>
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] hover:bg-[#20ba58] text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-xl hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>{t('cta.cta_whatsapp')}</span>
            </a>
            <Link to="/projects" className="btn-outline !px-8 !py-4">
              <span>{t('cta.cta_projects')}</span>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-12 pt-8 border-t border-white/10">
            {trustBadges.map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-gray-300 font-medium">
                <span className="w-1.5 h-1.5 bg-gold flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
