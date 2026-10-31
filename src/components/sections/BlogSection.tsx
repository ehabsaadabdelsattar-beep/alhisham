import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LuxuryButton from '../ui/LuxuryButton';
import { useLang } from '../../context/LanguageContext';
import { blogPosts } from '../../data';
import { FiArrowUpRight, FiClock, FiCalendar } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function BlogSection() {
  const { t } = useTranslation();
  const { lang, isRTL } = useLang();
  const posts = blogPosts.slice(0, 3);

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // 1. Header Reveal
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }

      // 2. Blog Cards Staggered Reveal
      if (gridRef.current) {
        const cards = gridRef.current.children;
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-ivory dark:bg-forest-dark border-t border-beige/60 dark:border-white/10">
      <div className="container-custom">
        {/* Header */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="section-subtitle">
              <span className="w-6 h-px bg-emerald dark:bg-gold" />
              {t('blog.subtitle')}
            </div>
            <h2 className="section-title text-forest dark:text-white font-sans">
              {lang === 'ar' ? (
                <>
                  أحدث مقالاتنا ورؤانا{' '}
                  <span className="font-readex font-normal text-emerald dark:text-gold block sm:inline">
                    المعمارية والهندسية
                  </span>
                </>
              ) : (
                <>
                  Architectural Insights &{' '}
                  <span className="font-editorial italic font-normal text-emerald dark:text-gold block sm:inline">
                    Market Perspective
                  </span>
                </>
              )}
            </h2>
            <div className="gold-divider" />
          </div>
          <LuxuryButton
            to="/blog"
            variant="outline-emerald"
            text={t('blog.view_all')}
            icon={
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            }
            className="!px-7 !py-3.5 !rounded-xl text-xs font-bold"
          />
        </div>

        {/* Editorial Blog Grid with 16px Rounded Cards (GSAP Staggered) */}
        <div ref={gridRef} className="grid md:grid-cols-3 gap-8">
          {posts.map(post => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="group card-luxury block rounded-2xl overflow-hidden bg-white dark:bg-forest/50 border border-beige/70 dark:border-white/10 hover:border-emerald/40 dark:hover:border-gold/40 shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <div className="relative overflow-hidden h-60">
                <img
                  src={post.image}
                  alt={lang === 'ar' ? post.titleAr : post.titleEn}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="overlay-gradient" />
                <span className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} bg-emerald text-white text-[10px] font-semibold tracking-wider px-3 py-1 rounded-full shadow-sm`}>
                  {lang === 'ar' ? post.categoryAr : post.categoryEn}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-textSecondary dark:text-gray-400 mb-3 font-sans">
                  <span className="flex items-center gap-1.5">
                    <FiCalendar className="w-3.5 h-3.5 text-gold" />
                    {formatDate(post.date)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <FiClock className="w-3.5 h-3.5 text-gold" />
                    {post.readTime} {lang === 'ar' ? 'دقائق قراءة' : 'min'}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-forest dark:text-white mb-3 leading-snug group-hover:text-emerald dark:group-hover:text-gold transition-colors line-clamp-2 font-sans">
                  {lang === 'ar' ? post.titleAr : post.titleEn}
                </h3>
                <p className="text-textSecondary dark:text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-6 font-light font-sans">
                  {lang === 'ar' ? post.summaryAr : post.summaryEn}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-beige/50 dark:border-white/10 text-emerald dark:text-gold text-xs font-semibold tracking-wider uppercase font-sans">
                  <span>{t('blog.read_more')}</span>
                  <FiArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
