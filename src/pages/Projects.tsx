import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../context/LanguageContext';
import { projects } from '../data';
import FadeIn from '../components/ui/FadeIn';

type Category = 'all' | 'residential' | 'commercial' | 'mixed';
type Status = 'all' | 'completed' | 'ongoing' | 'upcoming';

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  ongoing: 'bg-gold/10 text-gold border-gold/30',
  upcoming: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
};

export default function Projects() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const [searchParams] = useSearchParams();

  const initialFilter = (searchParams.get('filter') as Category) || 'all';
  const initialStatus = (searchParams.get('status') as Status) || 'all';

  const [filter, setFilter] = useState<Category>(initialFilter);
  const [statusFilter, setStatusFilter] = useState<Status>(initialStatus);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categoryFilters: { key: Category; label: string }[] = [
    { key: 'all', label: t('projects.filter_all') },
    { key: 'residential', label: t('projects.filter_residential') },
    { key: 'commercial', label: t('projects.filter_commercial') },
    { key: 'mixed', label: t('projects.filter_mixed') },
  ];

  const statusFilters: { key: Status; label: string }[] = [
    { key: 'all', label: t('projects.filter_all') },
    { key: 'completed', label: t('projects.status_completed') },
    { key: 'ongoing', label: t('projects.status_ongoing') },
    { key: 'upcoming', label: t('projects.status_upcoming') },
  ];

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchCategory = filter === 'all' || p.category === filter;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchSearch = search.trim() === '' ||
        p.titleAr.toLowerCase().includes(search.toLowerCase()) ||
        p.titleEn.toLowerCase().includes(search.toLowerCase()) ||
        p.locationAr.toLowerCase().includes(search.toLowerCase()) ||
        p.locationEn.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchStatus && matchSearch;
    });
  }, [filter, statusFilter, search]);

  const getStatusLabel = (s: string) => {
    if (s === 'completed') return t('projects.status_completed');
    if (s === 'ongoing') return t('projects.status_ongoing');
    return t('projects.status_upcoming');
  };

  return (
    <>
      <Helmet>
        <title>مشاريعنا | الهشام للتطوير العقاري</title>
        <meta name="description" content="استعرض مشاريع الهشام للتطوير العقاري - مشاريع سكنية وتجارية ومتعددة الاستخدامات." />
      </Helmet>

      {/* Page Hero */}
      <div className="relative pt-32 pb-20 bg-dark overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/80 to-dark" />
        <div className="container-custom relative z-10 text-center">
          <FadeIn>
            <p className="section-subtitle">{t('projects.subtitle')}</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl font-bold text-white mb-4">{t('projects.title')}</h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="gold-divider mx-auto" />
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              {lang === 'ar'
                ? 'نفخر بتقديم مجموعة متنوعة من المشاريع العقارية المتميزة التي تعكس التزامنا بالجودة والتميز.'
                : 'We pride ourselves on offering a diverse range of outstanding real estate projects reflecting our commitment to quality and excellence.'}
            </p>
          </FadeIn>
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-6">
            <Link to="/" className="hover:text-gold transition-colors">{t('nav.home')}</Link>
            <span>/</span>
            <span className="text-gold">{t('nav.projects')}</span>
          </div>
        </div>
      </div>

      {/* Search + Filters + Grid */}
      <section className="section-padding bg-surface dark:bg-dark-200">
        <div className="container-custom">
          {/* Search Bar */}
          <FadeIn delay={0.1}>
            <div className="max-w-xl mx-auto mb-10">
              <div className="relative">
                <svg className="absolute top-1/2 -translate-y-1/2 ltr:left-4 rtl:right-4 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={lang === 'ar' ? 'ابحث عن مشروع بالاسم أو الموقع...' : 'Search by name or location...'}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-12 rtl:pr-12 rtl:pl-4 pr-4 py-4 bg-white dark:bg-dark-300 border border-gray-200 dark:border-dark-400 focus:border-primary dark:focus:border-gold focus:outline-none text-dark dark:text-white transition-colors shadow-sm text-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 text-gray-400 hover:text-dark dark:hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </FadeIn>

          {/* Filters */}
          <FadeIn delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categoryFilters.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-5 py-2 text-sm font-medium border transition-all duration-200 ${
                      filter === key
                        ? 'bg-primary text-white border-primary shadow-green'
                        : 'bg-white dark:bg-dark-300 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-dark-300 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {label}
                    <span className={`mr-1.5 rtl:ml-1.5 rtl:mr-0 text-xs px-1.5 py-0.5 rounded-full ${filter === key ? 'bg-white/20' : 'bg-gray-100 dark:bg-dark-400'}`}>
                      {key === 'all' ? projects.length : projects.filter(p => p.category === key).length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Status + View Mode */}
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as Status)}
                  className="px-4 py-2 bg-white dark:bg-dark-300 border border-gray-200 dark:border-dark-400 text-sm text-dark dark:text-white focus:outline-none focus:border-primary cursor-pointer"
                >
                  {statusFilters.map(s => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>

                <div className="flex border border-gray-200 dark:border-dark-400 overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white dark:bg-dark-300 text-gray-500'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white dark:bg-dark-300 text-gray-500'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Results Count */}
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {lang === 'ar' ? `عرض ${filtered.length} مشروع` : `Showing ${filtered.length} projects`}
          </div>

          {/* Grid / List */}
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <svg className="w-16 h-16 text-gray-300 dark:text-dark-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                </svg>
                <p className="text-gray-500 text-lg">{lang === 'ar' ? 'لا توجد مشاريع تطابق البحث' : 'No projects match your search'}</p>
              </motion.div>
            ) : (
              <motion.div
                key={`${filter}-${statusFilter}-${viewMode}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}
              >
                {filtered.map((project, i) => (
                  viewMode === 'grid' ? (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                    >
                      <Link to={`/projects/${project.id}`} className="group card-luxury block h-full">
                        <div className="relative overflow-hidden h-64">
                          <img
                            src={project.image}
                            alt={lang === 'ar' ? project.titleAr : project.titleEn}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="overlay-gradient" />
                          <div className={`absolute top-4 ${lang === 'ar' ? 'right-4' : 'left-4'} px-3 py-1 text-xs font-semibold border rounded-full ${statusColors[project.status]}`}>
                            {getStatusLabel(project.status)}
                          </div>
                          <div className="absolute bottom-4 right-4 rtl:left-4 rtl:right-auto text-white text-xs">
                            <span className="bg-primary/80 backdrop-blur-sm px-2 py-1">{project.area} م²</span>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="font-bold text-lg text-dark dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-gold transition-colors">
                            {lang === 'ar' ? project.titleAr : project.titleEn}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              {lang === 'ar' ? project.locationAr : project.locationEn}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {project.year}
                            </span>
                          </div>
                          {project.status === 'ongoing' && (
                            <div className="mb-4">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>{lang === 'ar' ? 'نسبة الإنجاز' : 'Progress'}</span>
                                <span className="text-primary font-semibold">{project.progress}%</span>
                              </div>
                              <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${project.progress}%` }} />
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-primary dark:text-gold text-sm font-semibold group-hover:gap-3 transition-all">
                            {t('projects.view_details')}
                            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ) : (
                    /* List View */
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <Link to={`/projects/${project.id}`} className="group flex gap-6 bg-white dark:bg-dark-300 shadow-sm hover:shadow-luxury transition-all border border-gray-100 dark:border-dark-400">
                        <div className="relative w-48 h-36 flex-shrink-0 overflow-hidden">
                          <img
                            src={project.image}
                            alt={lang === 'ar' ? project.titleAr : project.titleEn}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className={`absolute top-2 ltr:left-2 rtl:right-2 px-2 py-0.5 text-xs font-semibold border rounded-full ${statusColors[project.status]}`}>
                            {getStatusLabel(project.status)}
                          </div>
                        </div>
                        <div className="flex-1 py-4 pr-4 rtl:pl-4 rtl:pr-0">
                          <h3 className="font-bold text-lg text-dark dark:text-white mb-1 group-hover:text-primary dark:group-hover:text-gold transition-colors">
                            {lang === 'ar' ? project.titleAr : project.titleEn}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {lang === 'ar' ? project.locationAr : project.locationEn}
                            <span className="mx-2 text-gray-300">·</span>
                            {project.year}
                            <span className="mx-2 text-gray-300">·</span>
                            {project.area} م²
                          </p>
                          {project.status === 'ongoing' && (
                            <div className="max-w-xs">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>{lang === 'ar' ? 'نسبة الإنجاز' : 'Progress'}</span>
                                <span className="text-primary font-semibold">{project.progress}%</span>
                              </div>
                              <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${project.progress}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  )
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
