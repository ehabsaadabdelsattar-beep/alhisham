import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLang } from '../context/LanguageContext';
import { jobs } from '../data';

const WHATSAPP = '201103657888';

export default function Careers() {
  const { t } = useTranslation();
  const { lang } = useLang();

  return (
    <>
      <Helmet>
        <title>{t('nav.careers')} | الهشام للتطوير العقاري</title>
        <meta name="description" content="انضم إلى فريق الهشام للتطوير العقاري واكتشف فرص العمل المتاحة لتطوير مسيرتك المهنية في قطاع العقارات." />
      </Helmet>

      {/* Page Hero */}
      <div className="relative pt-32 pb-20 bg-dark overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/80 to-dark" />
        <div className="container-custom relative z-10 text-center">
          <p className="section-subtitle">فريق العمل</p>
          <h1 className="text-5xl font-bold text-white mb-4">الوظائف المتاحة</h1>
          <div className="gold-divider mx-auto" />
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            {lang === 'ar'
              ? 'نبحث دائماً عن الكفاءات المتميزة للانضمام إلى فريق عملنا والمساهمة في رحلة نجاحنا وتطورنا المستمر.'
              : 'We are always looking for outstanding talents to join our team and contribute to our continuous success and development journey.'}
          </p>
        </div>
      </div>

      <section className="section-padding bg-surface dark:bg-dark-200">
        <div className="container-custom">
          {jobs.length > 0 ? (
            <div className="space-y-6 max-w-4xl mx-auto">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white dark:bg-dark-300 p-8 shadow-sm border border-gray-100 dark:border-dark-400 hover:border-primary transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div>
                      <h3 className="text-2xl font-bold text-dark dark:text-white mb-2 group-hover:text-primary transition-colors">
                        {lang === 'ar' ? job.titleAr : job.titleEn}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {lang === 'ar' ? job.locationAr : job.locationEn}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          {lang === 'ar' ? job.typeAr : job.typeEn}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base">
                        {lang === 'ar' ? job.descriptionAr : job.descriptionEn}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <a
                        href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`مرحباً، أود التقديم على وظيفة: ${lang === 'ar' ? job.titleAr : job.titleEn}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary w-full md:w-auto"
                      >
                        التقدم للوظيفة
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-gray-300 dark:text-dark-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <h3 className="text-xl font-bold text-dark dark:text-white mb-2">لا توجد وظائف متاحة حالياً</h3>
              <p className="text-gray-500">يرجى متابعة هذه الصفحة للحصول على أحدث الفرص الوظيفية.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
