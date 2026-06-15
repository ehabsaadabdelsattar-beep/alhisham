import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLang } from '../context/LanguageContext';
import { blogPosts } from '../data';

export default function Blog() {
  const { t } = useTranslation();
  const { lang } = useLang();

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  return (
    <>
      <Helmet>
        <title>{t('nav.blog')} | الهشام للتطوير العقاري</title>
        <meta name="description" content="اقرأ أحدث المقالات والأخبار العقارية ونصائح الاستثمار والتطوير العقاري من الهشام للتطوير العقاري." />
      </Helmet>

      {/* Page Hero */}
      <div className="relative pt-32 pb-20 bg-dark overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1554469234-9c747623e568?w=1920&q=80)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/80 to-dark" />
        <div className="container-custom relative z-10 text-center">
          <p className="section-subtitle">{t('blog.subtitle')}</p>
          <h1 className="text-5xl font-bold text-white mb-4">{t('blog.title')}</h1>
          <div className="gold-divider mx-auto" />
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            {lang === 'ar'
              ? 'نبقيك على إطلاع دائم بآخر التطورات والأخبار والنصائح في سوق العقارات والاستثمار.'
              : 'Keeping you updated with the latest developments, news, and tips in the real estate and investment market.'}
          </p>
        </div>
      </div>

      <section className="section-padding bg-surface dark:bg-dark-200">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="group card-luxury block bg-white dark:bg-dark-300 h-full flex flex-col"
              >
                <div className="relative overflow-hidden h-60 flex-shrink-0">
                  <img
                    src={post.image}
                    alt={lang === 'ar' ? post.titleAr : post.titleEn}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="overlay-gradient" />
                  <span className="absolute bottom-4 right-4 rtl:left-4 rtl:right-auto bg-gold text-dark text-xs font-bold px-3 py-1">
                    {lang === 'ar' ? post.categoryAr : post.categoryEn}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(post.date)}
                    </span>
                    <span>•</span>
                    <span>{post.readTime} {lang === 'ar' ? 'دقائق قراءة' : 'min read'}</span>
                  </div>
                  <h3 className="font-bold text-lg text-dark dark:text-white mb-3 leading-snug group-hover:text-primary dark:group-hover:text-gold transition-colors line-clamp-2">
                    {lang === 'ar' ? post.titleAr : post.titleEn}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
                    {lang === 'ar' ? post.summaryAr : post.summaryEn}
                  </p>
                  <div className="flex items-center gap-2 text-primary dark:text-gold text-sm font-semibold group-hover:gap-3 transition-all duration-200 mt-auto">
                    {t('blog.read_more')}
                    <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
