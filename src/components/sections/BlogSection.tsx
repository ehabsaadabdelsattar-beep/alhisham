import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLang } from '../../context/LanguageContext';
import { blogPosts } from '../../data';

export default function BlogSection() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const posts = blogPosts.slice(0, 3);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  return (
    <section className="section-padding bg-surface dark:bg-dark-200">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="section-subtitle">{t('blog.subtitle')}</p>
            <h2 className="section-title text-dark dark:text-white">{t('blog.title')}</h2>
            <div className="gold-divider" />
          </div>
          <Link to="/blog" className="btn-outline-primary flex-shrink-0 self-start">
            {t('blog.view_all')}
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="group card-luxury block"
            >
              <div className="relative overflow-hidden h-52">
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
              <div className="p-6">
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
                <h3 className="font-bold text-dark dark:text-white mb-3 leading-snug group-hover:text-primary dark:group-hover:text-gold transition-colors line-clamp-2">
                  {lang === 'ar' ? post.titleAr : post.titleEn}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4">
                  {lang === 'ar' ? post.summaryAr : post.summaryEn}
                </p>
                <div className="flex items-center gap-2 text-primary dark:text-gold text-sm font-semibold group-hover:gap-3 transition-all duration-200">
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
  );
}
