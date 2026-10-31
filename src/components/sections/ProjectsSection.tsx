import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LuxuryButton from '../ui/LuxuryButton';
import { useLang } from '../../context/LanguageContext';
import { projectsService } from '../../services/projects';
import type { Project } from '../../services/projects';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiArrowUpRight, FiMapPin, FiGrid, FiMove } from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

type Filter = 'all' | 'residential' | 'commercial' | 'mixed';

const statusBadgeColors: Record<string, string> = {
  completed: 'bg-emerald text-white border-emerald/50',
  under_construction: 'bg-gold/90 text-forest border-gold font-bold',
  upcoming: 'bg-forest/90 text-ivory border-white/20',
  planning: 'bg-beige/80 text-forest border-beige',
  sold_out: 'bg-red-800 text-white border-red-700',
};

const statusLabels: Record<string, { ar: string; en: string }> = {
  completed: { ar: 'مكتمل وجاهز', en: 'Completed' },
  under_construction: { ar: 'قيد التنفيذ', en: 'Under Construction' },
  upcoming: { ar: 'قريباً', en: 'Upcoming' },
  planning: { ar: 'مرحلة التخطيط', en: 'Planning' },
  sold_out: { ar: 'تم البيع بالكامل', en: 'Sold Out' },
};

export default function ProjectsSection() {
  const { t } = useTranslation();
  const { lang, isRTL } = useLang();
  const [filter, setFilter] = useState<Filter>('all');
  const [viewMode, setViewMode] = useState<'panoramic' | 'grid'>('panoramic');
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsService.getProjects({ publishedOnly: true });
      setDbProjects(data);
    } catch (err) {
      console.error('Error fetching projects for section:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProjects();
  }, []);

  // GSAP Header Reveal on Scroll
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  // Animate cards on filter change or data load using GSAP
  useEffect(() => {
    if (loading) return;

    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const cards = section.querySelectorAll('.project-card-item');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 35, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out',
            overwrite: 'auto',
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, [filter, viewMode, loading, dbProjects]);

  // Reset panoramic position on filter or view mode change
  useEffect(() => {
    if (wrapperRef.current) {
      gsap.to(wrapperRef.current, { x: 0, duration: 0.35, ease: 'power1.out' });
    }
  }, [filter, viewMode]);

  // One Green Way Magnetic Cursor-Follow Cards Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (viewMode !== 'panoramic' || window.innerWidth <= 991 || !triggerRef.current || !wrapperRef.current) {
      return;
    }

    const trigger = triggerRef.current;
    const wrapper = wrapperRef.current;

    const triggerWidth = trigger.offsetWidth;
    const wrapperWidth = wrapper.scrollWidth;

    if (wrapperWidth <= triggerWidth) return;

    const padding = triggerWidth * 0.15; // 15% padding
    const rect = trigger.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    const minX = padding;
    const maxX = triggerWidth - padding;
    const clampedX = Math.min(Math.max(mouseX, minX), maxX);

    const percentage = (clampedX - minX) / (maxX - minX);
    const maxOffset = wrapperWidth - triggerWidth + 40;

    // Support both LTR and RTL translations
    const newX = isRTL ? maxOffset * percentage : -maxOffset * percentage;

    gsap.to(wrapper, {
      x: newX,
      duration: 0.2, // Smooth, immediate response matching One Green Way
      ease: 'power1.inOut',
      overwrite: 'auto',
    });
  };

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('projects.filter_all') },
    { key: 'residential', label: t('projects.filter_residential') },
    { key: 'commercial', label: t('projects.filter_commercial') },
    { key: 'mixed', label: t('projects.filter_mixed') },
  ];

  const filtered = filter === 'all'
    ? dbProjects
    : dbProjects.filter(p => p.category === filter);

  const renderProjectCard = (project: Project, _i: number, isPanoramic: boolean) => (
    <div
      key={project.id}
      className={`project-card-item group ${isPanoramic ? 'w-[320px] sm:w-[380px] lg:w-[410px] flex-shrink-0' : 'w-full'}`}
    >
      <Link
        to={`/projects/${project.slug}`}
        className="block card-luxury border border-beige/80 dark:border-white/10 hover:border-emerald/40 dark:hover:border-gold/40 transition-all duration-500 rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl bg-white dark:bg-forest/50"
      >
        {/* Image Container with Floating Action Arrow */}
        <div className="relative overflow-hidden h-72">
          <img
            src={project.cover_image || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80'}
            alt={lang === 'ar' ? project.title_ar : project.title_en}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="overlay-gradient" />

          {/* Status Badge */}
          <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider border backdrop-blur-md shadow-sm ${statusBadgeColors[project.status] || 'bg-black/60 text-white'}`}>
            {statusLabels[project.status]?.[lang === 'ar' ? 'ar' : 'en'] || project.status}
          </div>

          {/* Floating One Green Way Interactive Hover Arrow */}
          <div className={`absolute bottom-4 ${isRTL ? 'left-4' : 'right-4'} w-10 h-10 rounded-full bg-white/90 dark:bg-forest/90 text-forest dark:text-ivory flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-gold group-hover:text-forest transition-all duration-300 border border-white/20`}>
            <FiArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>

          {/* Location Badge */}
          <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} flex items-center gap-1.5 text-xs text-white/95 font-medium drop-shadow`}>
            <FiMapPin className="w-4 h-4 text-gold flex-shrink-0" />
            <span className="truncate max-w-[200px]">{lang === 'ar' ? project.location_ar || 'موقع استراتيجي' : project.location_en || 'Strategic Location'}</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-forest dark:text-white mb-2 group-hover:text-emerald dark:group-hover:text-gold transition-colors font-sans truncate">
            {lang === 'ar' ? project.title_ar : project.title_en}
          </h3>
          <p className="text-textSecondary dark:text-gray-300 text-xs leading-relaxed line-clamp-2 mb-5 font-sans">
            {lang === 'ar' ? project.description_ar : project.description_en}
          </p>

          {/* Progress Bar (if under construction) */}
          {project.status === 'under_construction' && (
            <div className="mb-5 pt-3 border-t border-beige/40 dark:border-white/10">
              <div className="flex justify-between text-xs text-textSecondary dark:text-gray-400 mb-1.5 font-sans">
                <span>{lang === 'ar' ? 'نسبة الإنجاز المعماري' : 'Construction Progress'}</span>
                <span className="text-emerald dark:text-gold font-bold">{project.progress}%</span>
              </div>
              <div className="h-1.5 bg-beige/60 dark:bg-forest-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald to-gold rounded-full transition-all duration-1000"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* View Details Link */}
          <div className="flex items-center justify-between pt-3 border-t border-beige/40 dark:border-white/10 text-xs font-semibold text-emerald dark:text-gold tracking-wide font-sans">
            <span>{t('projects.view_details')}</span>
            <span className="text-sm rtl:rotate-180">→</span>
          </div>
        </div>
      </Link>
    </div>
  );

  return (
    <section ref={sectionRef} className="section-padding bg-ivory dark:bg-forest-dark relative overflow-hidden">
      <div className="container-custom">
        {/* Section Header */}
        <div ref={headerRef} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-14">
          <div>
            <div className="section-subtitle">
              <span className="w-6 h-px bg-emerald dark:bg-gold" />
              {t('projects.subtitle')}
            </div>
            <h2 className="section-title text-forest dark:text-white">
              {lang === 'ar' ? (
                <>
                  مشاريع سكنية وتجارية{' '}
                  <span className="font-readex font-normal text-emerald dark:text-gold block sm:inline">
                    بمعايير عالمية
                  </span>
                </>
              ) : (
                <>
                  Distinctive Living &{' '}
                  <span className="font-editorial italic font-normal text-emerald dark:text-gold block sm:inline">
                    Architectural Landmarks
                  </span>
                </>
              )}
            </h2>
            <div className="gold-divider" />
          </div>

          {/* Controls: Filter Pills & View Mode Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {filters.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 ${
                    filter === key
                      ? 'bg-emerald text-white shadow-md border border-emerald'
                      : 'bg-white/80 dark:bg-forest/50 text-textSecondary dark:text-gray-300 border border-beige/80 dark:border-white/10 hover:border-emerald hover:text-emerald dark:hover:text-gold'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* View Mode Toggle (Panoramic Drift vs Grid) */}
            <div className="hidden sm:flex items-center p-1 rounded-xl bg-white/80 dark:bg-forest/50 border border-beige/80 dark:border-white/10">
              <button
                onClick={() => setViewMode('panoramic')}
                title={lang === 'ar' ? 'عرض بانورامي تفاعلي' : 'Panoramic Drift View'}
                className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'panoramic'
                    ? 'bg-emerald text-white shadow-sm'
                    : 'text-textSecondary dark:text-gray-400 hover:text-forest dark:hover:text-white'
                }`}
              >
                <FiMove className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title={lang === 'ar' ? 'عرض شبكي' : 'Grid View'}
                className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-emerald text-white shadow-sm'
                    : 'text-textSecondary dark:text-gray-400 hover:text-forest dark:hover:text-white'
                }`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Panoramic Mode Hint (Desktop) */}
        {viewMode === 'panoramic' && (
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-semibold text-textSecondary dark:text-gray-400 uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
            <span>
              {lang === 'ar'
                ? 'حرك مؤشر الماوس أفقياً لاستكشاف المشاريع بانورامياً'
                : 'Move cursor horizontally across screen to explore the panoramic portfolio'}
            </span>
          </div>
        )}

        {/* Content Loading & Empty States */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 rounded-2xl bg-beige/40 dark:bg-forest/40 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-textSecondary dark:text-gray-400 text-sm">
            {lang === 'ar' ? 'لا توجد مشاريع في هذا التصنيف حالياً.' : 'No projects found in this category.'}
          </div>
        ) : viewMode === 'panoramic' ? (
          /* One Green Way Magnetic Cursor-Follow Cards Wrapper */
          <div
            ref={triggerRef}
            onMouseMove={handleMouseMove}
            className="cards-hover-trigger relative w-full overflow-hidden max-lg:overflow-x-auto max-lg:scrollbar-none py-2"
          >
            <div
              ref={wrapperRef}
              className="cards_wrapper flex flex-nowrap gap-7 w-max will-change-transform"
            >
              {filtered.map((project, i) => renderProjectCard(project, i, true))}
            </div>
          </div>
        ) : (
          /* Standard Architectural Grid View */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((project, i) => renderProjectCard(project, i, false))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-16">
          <LuxuryButton
            to="/projects"
            variant="outline-emerald"
            text={t('projects.view_all')}
            icon={
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            }
            className="!px-10 !py-4 !rounded-xl font-bold text-xs shadow-sm hover:shadow-md"
          />
        </div>
      </div>
    </section>
  );
}
