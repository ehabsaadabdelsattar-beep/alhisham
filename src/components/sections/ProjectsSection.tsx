import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLang } from '../../context/LanguageContext';
import { projects } from '../../data';

type Filter = 'all' | 'residential' | 'commercial' | 'mixed';

const statusColors = {
  completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  ongoing: 'bg-gold/10 text-gold border-gold/30',
  upcoming: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
};

export default function ProjectsSection() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const [filter, setFilter] = useState<Filter>('all');

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('projects.filter_all') },
    { key: 'residential', label: t('projects.filter_residential') },
    { key: 'commercial', label: t('projects.filter_commercial') },
    { key: 'mixed', label: t('projects.filter_mixed') },
  ];

  const filtered = filter === 'all' ? projects : projects.filter(p => p.category === filter);

  const getStatusLabel = (s: string) => {
    if (s === 'completed') return t('projects.status_completed');
    if (s === 'ongoing') return t('projects.status_ongoing');
    return t('projects.status_upcoming');
  };

  return (
    <section className="section-padding bg-white dark:bg-dark-100">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="section-subtitle">{t('projects.subtitle')}</p>
            <h2 className="section-title text-dark dark:text-white">{t('projects.title')}</h2>
            <div className="gold-divider" />
          </div>
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filters.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-5 py-2 text-sm font-medium border transition-all duration-200 ${
                  filter === key
                    ? 'bg-primary text-white border-primary'
                    : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-dark-300 hover:border-primary hover:text-primary dark:hover:text-gold'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(0, 6).map((project, i) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group card-luxury block"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Image */}
              <div className="relative overflow-hidden h-56">
                <img
                  src={project.image}
                  alt={lang === 'ar' ? project.titleAr : project.titleEn}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay */}
                <div className="overlay-gradient" />
                {/* Status Badge */}
                <div className={`absolute top-4 ${lang === 'ar' ? 'right-4' : 'left-4'} px-3 py-1 text-xs font-semibold border rounded-full ${statusColors[project.status]}`}>
                  {getStatusLabel(project.status)}
                </div>
                {/* Category */}
                <div className={`absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} px-3 py-1 bg-dark/60 text-white text-xs rounded-full backdrop-blur-sm`}>
                  {project.category === 'residential' ? t('projects.filter_residential') :
                   project.category === 'commercial' ? t('projects.filter_commercial') : t('projects.filter_mixed')}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-bold text-lg text-dark dark:text-white mb-1 group-hover:text-primary dark:group-hover:text-gold transition-colors">
                  {lang === 'ar' ? project.titleAr : project.titleEn}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1.5 mb-4">
                  <svg className="w-3.5 h-3.5 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {lang === 'ar' ? project.locationAr : project.locationEn}
                </p>

                {/* Progress bar (for ongoing) */}
                {project.status === 'ongoing' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>نسبة الإنجاز</span>
                      <span className="text-primary font-semibold">{project.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="flex items-center gap-2 text-primary dark:text-gold text-sm font-semibold group-hover:gap-3 transition-all duration-200">
                  {t('projects.view_details')}
                  <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-12">
          <Link to="/projects" className="btn-outline-primary">
            {t('projects.view_all')}
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
