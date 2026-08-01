import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLang } from '../../context/LanguageContext';
import { projectsService } from '../../services/projects';
import type { Project } from '../../services/projects';
import { motion, AnimatePresence } from 'framer-motion';

type Filter = 'all' | 'residential' | 'commercial' | 'mixed';

const statusBadgeColors: Record<string, string> = {
  completed: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50',
  under_construction: 'bg-gold/15 text-gold border-gold/40',
  upcoming: 'bg-blue-950/80 text-blue-400 border-blue-800/50',
  planning: 'bg-purple-950/80 text-purple-400 border-purple-800/50',
  sold_out: 'bg-red-950/80 text-red-400 border-red-800/50',
};

const statusLabels: Record<string, { ar: string; en: string }> = {
  completed: { ar: 'مكتمل', en: 'Completed' },
  under_construction: { ar: 'قيد التنفيذ', en: 'Under Construction' },
  upcoming: { ar: 'قريباً', en: 'Upcoming' },
  planning: { ar: 'التخطيط', en: 'Planning' },
  sold_out: { ar: 'مباع', en: 'Sold Out' },
};

export default function ProjectsSection() {
  const { t } = useTranslation();
  const { lang, isRTL } = useLang();
  const [filter, setFilter] = useState<Filter>('all');
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('projects.filter_all') },
    { key: 'residential', label: t('projects.filter_residential') },
    { key: 'commercial', label: t('projects.filter_commercial') },
    { key: 'mixed', label: t('projects.filter_mixed') },
  ];

  const filtered = filter === 'all'
    ? dbProjects
    : dbProjects.filter(p => p.category === filter);

  return (
    <section className="section-padding bg-surface dark:bg-black relative overflow-hidden">
      <div className="container-custom">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div>
            <span className="section-subtitle">{t('projects.subtitle')}</span>
            <h2 className="section-title text-dark dark:text-white">
              {lang === 'ar' ? 'أبرز مشاريعنا العقارية' : 'Featured Developments'}
            </h2>
            <div className="gold-divider" />
          </div>

          {/* Luxury Filter Controls */}
          <div className="flex flex-wrap gap-2">
            {filters.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  filter === key
                    ? 'bg-gold text-dark border border-gold shadow-lg'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-gold hover:text-gold'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Editorial Project Portfolio Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 dark:bg-dark-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            {lang === 'ar' ? 'لا توجد مشاريع في هذا التصنيف حالياً.' : 'No projects found in this category.'}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.slice(0, 6).map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group"
              >
                <Link
                  to={`/projects/${project.slug}`}
                  className="block card-luxury group border border-gray-100 dark:border-gray-800/80 hover:border-gold/40 transition-all duration-500"
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden h-72">
                    <img
                      src={project.cover_image || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80'}
                      alt={lang === 'ar' ? project.title_ar : project.title_en}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="overlay-gradient" />

                    {/* Status Badge */}
                    <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} px-3 py-1 text-[11px] font-bold uppercase tracking-wider border backdrop-blur-md ${statusBadgeColors[project.status] || 'bg-black/60 text-white'}`}>
                      {statusLabels[project.status]?.[lang === 'ar' ? 'ar' : 'en'] || project.status}
                    </div>

                    {/* Location Badge */}
                    <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} flex items-center gap-1.5 text-xs text-white/90 font-medium drop-shadow`}>
                      <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span>{lang === 'ar' ? project.location_ar || 'موقع متميز' : project.location_en || 'Prime Location'}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-dark dark:text-white mb-2 group-hover:text-gold transition-colors">
                      {lang === 'ar' ? project.title_ar : project.title_en}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed line-clamp-2 mb-5">
                      {lang === 'ar' ? project.description_ar : project.description_en}
                    </p>

                    {/* Progress Bar (if under construction) */}
                    {project.status === 'under_construction' && (
                      <div className="mb-5 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                          <span>{lang === 'ar' ? 'نسبة الإنجاز المعماري' : 'Construction Progress'}</span>
                          <span className="text-gold font-bold">{project.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gold rounded-full transition-all duration-1000" style={{ width: `${project.progress}%` }} />
                        </div>
                      </div>
                    )}

                    {/* View Details Link */}
                    <div className="flex items-center gap-2 text-gold text-xs font-bold tracking-widest uppercase group-hover:gap-3 transition-all duration-300 pt-2 border-t border-gray-100 dark:border-gray-800/80">
                      <span>{t('projects.view_details')}</span>
                      <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-16">
          <Link to="/projects" className="btn-outline-gold !px-10 !py-4">
            <span>{t('projects.view_all')}</span>
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
