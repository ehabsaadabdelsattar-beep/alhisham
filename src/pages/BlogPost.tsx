import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLang } from '../context/LanguageContext';
import { blogPosts } from '../data';

export default function BlogPost() {
  const { id } = useParams();
  const { lang } = useLang();

  const post = blogPosts.find(p => p.id === id);
  if (!post) return <Navigate to="/blog" />;

  const title = lang === 'ar' ? post.titleAr : post.titleEn;
  const content = lang === 'ar' ? post.contentAr : post.contentEn;
  const summary = lang === 'ar' ? post.summaryAr : post.summaryEn;
  const category = lang === 'ar' ? post.categoryAr : post.categoryEn;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  return (
    <>
      <Helmet>
        <title>{title} | الهشام للتطوير العقاري</title>
        <meta name="description" content={summary} />
      </Helmet>

      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img src={post.image} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />
        <div className="absolute bottom-10 left-0 right-0">
          <div className="container-custom max-w-4xl">
            <span className="inline-block bg-gold text-dark text-xs font-bold px-3 py-1 mb-4">
              {category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">{title}</h1>
            <div className="flex items-center gap-4 text-gray-300 text-sm">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(post.date)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {post.readTime} {lang === 'ar' ? 'دقائق قراءة' : 'min read'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <section className="section-padding bg-white dark:bg-dark-100">
        <div className="container-custom max-w-4xl">
          <div className="prose prose-lg dark:prose-invert prose-gold max-w-none">
            {content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-dark-300 flex justify-between items-center">
            <Link to="/blog" className="flex items-center gap-2 text-primary dark:text-gold hover:underline font-medium">
              <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {lang === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
