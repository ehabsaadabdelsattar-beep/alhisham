import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import { useLang } from '../context/LanguageContext';
import { projectsService } from '../services/projects';
import type { Project } from '../services/projects';
import SEO from '../components/ui/SEO';

const WHATSAPP = '201103657888';

// ─────────────────────────────────────────────────────────────────
// Helper: build Google Maps embed URL for a precise project pin
// Priority: lat+lng > google_maps_url > location text
// ─────────────────────────────────────────────────────────────────
function buildMapEmbedUrl(project: Project, fallbackText: string): string | null {
  // 1. Coordinates → most precise, shows a pin
  if (project.latitude && project.longitude) {
    return `https://maps.google.com/maps?q=${project.latitude},${project.longitude}&z=15&output=embed`;
  }

  // 2. Try to extract coordinates from google_maps_url if it contains @lat,lng pattern
  if (project.google_maps_url) {
    const coordMatch = project.google_maps_url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=15&output=embed`;
    }

    // 3. If it's a maps.google.com link with a q= param, use it as embed
    if (
      project.google_maps_url.includes('maps.google') ||
      project.google_maps_url.includes('google.com/maps')
    ) {
      // Convert share link to embed if needed
      if (project.google_maps_url.includes('output=embed')) {
        return project.google_maps_url;
      }
      // Try to build an embed from the place URL
      const placeMatch = project.google_maps_url.match(/place\/([^/]+)/);
      if (placeMatch) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')))}&z=14&output=embed`;
      }
    }
  }

  // 4. Fallback: use location text to search on the map
  if (fallbackText && fallbackText.trim()) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackText)}&z=13&output=embed`;
  }

  return null;
}

// Build the "Open in Google Maps" link for the button
function buildMapsOpenUrl(project: Project, fallbackText: string): string {
  if (project.latitude && project.longitude) {
    return `https://www.google.com/maps?q=${project.latitude},${project.longitude}`;
  }
  if (project.google_maps_url) {
    return project.google_maps_url;
  }
  return `https://www.google.com/maps/search/${encodeURIComponent(fallbackText)}`;
}

// Status display config
const STATUS_COLORS: Record<string, string> = {
  completed:          'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  under_construction: 'bg-gold/20 text-gold border-gold/40',
  upcoming:           'bg-blue-500/20 text-blue-400 border-blue-500/40',
  sold_out:           'bg-red-500/20 text-red-400 border-red-500/40',
  planning:           'bg-purple-500/20 text-purple-400 border-purple-500/40',
};

const STATUS_LABELS: Record<string, { ar: string; en: string }> = {
  completed:          { ar: 'مكتمل', en: 'Completed' },
  under_construction: { ar: 'قيد الإنشاء', en: 'Under Construction' },
  upcoming:           { ar: 'قريباً', en: 'Upcoming' },
  sold_out:           { ar: 'مباع بالكامل', en: 'Sold Out' },
  planning:           { ar: 'قيد التخطيط', en: 'In Planning' },
};

const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  residential: { ar: 'سكني', en: 'Residential' },
  commercial:  { ar: 'تجاري', en: 'Commercial' },
  mixed:       { ar: 'متعدد الاستخدامات', en: 'Mixed Use' },
};

// Format date string to readable format
function formatDate(dateStr: string | undefined, lang: string): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr; // Return as-is if invalid date
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long' });
  } catch {
    return dateStr;
  }
}

// ─────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────
export default function ProjectDetail() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { lang } = useLang();

  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch fresh from Supabase every time slug changes
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setErrorMsg('');
    setProject(null);
    projectsService.getProjectBySlug(slug)
      .then(data => {
        setProject(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching project detail:', err);
        setErrorMsg(lang === 'ar' ? 'عذراً، لم نتمكن من العثور على هذا المشروع.' : 'Sorry, project not found.');
        setLoading(false);
      });
  }, [slug]);

  // ── Loading State ──
  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex flex-col justify-center items-center bg-dark text-white">
        <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm animate-pulse">
          {lang === 'ar' ? 'جاري تحميل تفاصيل المشروع...' : 'Loading project details...'}
        </p>
      </div>
    );
  }

  // ── Error / Not Found State ──
  if (errorMsg || !project) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex flex-col justify-center items-center bg-dark text-white text-center px-4">
        <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center text-gold text-3xl mb-6">
          🏢
        </div>
        <h2 className="text-3xl font-bold mb-4">
          {errorMsg || (lang === 'ar' ? 'المشروع غير موجود' : 'Project Not Found')}
        </h2>
        <p className="text-gray-400 max-w-md mb-8">
          {lang === 'ar'
            ? 'ربما تم تغيير رابط المشروع أو إزالته.'
            : 'The requested project may have been removed or its link changed.'}
        </p>
        <Link to="/projects" className="btn-gold px-8 py-3 rounded-sm font-semibold">
          {lang === 'ar' ? 'عرض جميع المشاريع' : 'Browse All Projects'}
        </Link>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // All data comes from Supabase — NO hardcoded values
  // ─────────────────────────────────────────────────────────────────
  const title       = (lang === 'ar' ? project.title_ar : project.title_en) || project.title_ar || project.title_en || '';
  const location    = (lang === 'ar' ? project.location_ar : project.location_en) || project.location_ar || project.location_en || '';
  const address     = (lang === 'ar' ? project.address_ar : project.address_en) || address || '';
  const description = (lang === 'ar' ? project.description_ar : project.description_en) || project.description_ar || project.description_en || '';

  // Location display: prefer location_name, then bilingual, then address
  const locationDisplay = project.location_name || location || address || '';

  // Status
  const statusLabel = STATUS_LABELS[project.status]?.[lang === 'ar' ? 'ar' : 'en'] || project.status;
  const statusColor = STATUS_COLORS[project.status] || 'bg-gold/20 text-gold border-gold/40';

  // Category
  const categoryLabel = CATEGORY_LABELS[project.category]?.[lang === 'ar' ? 'ar' : 'en'] || project.category;

  // Gallery images: project_images table OR cover_image
  const galleryImages: string[] = (() => {
    const fromRelation = (project as any).project_images;
    if (Array.isArray(fromRelation) && fromRelation.length > 0) {
      return fromRelation.map((img: any) => img.image_url).filter(Boolean);
    }
    if (project.cover_image) return [project.cover_image];
    return [];
  })();

  // Features array
  const featuresList: string[] = Array.isArray(project.features)
    ? project.features
    : typeof project.features === 'string'
    ? (project.features as string).split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // Map
  const mapEmbedUrl = buildMapEmbedUrl(project, locationDisplay);
  const mapsOpenUrl = buildMapsOpenUrl(project, locationDisplay);

  // WhatsApp inquiry
  const sendToWhatsApp = () => {
    const msg = encodeURIComponent(
      `مرحباً، أود الاستفسار عن مشروع: ${title}\nالموقع: ${locationDisplay}\nالاسم: ${form.name}\nالهاتف: ${form.phone}\nالرسالة: ${form.message}`
    );
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank');
  };

  // Sidebar spec items — all from Supabase
  const specItems = [
    {
      icon: '📍',
      label: lang === 'ar' ? 'الموقع' : 'Location',
      value: locationDisplay || null,
    },
    {
      icon: '🏢',
      label: lang === 'ar' ? 'العنوان التفصيلي' : 'Detailed Address',
      value: address || null,
    },
    {
      icon: '🏗️',
      label: lang === 'ar' ? 'التصنيف' : 'Category',
      value: categoryLabel,
    },
    {
      icon: '✅',
      label: lang === 'ar' ? 'حالة المشروع' : 'Status',
      value: statusLabel,
    },
    {
      icon: '📐',
      label: lang === 'ar' ? 'المساحة الإجمالية' : 'Total Area',
      value: project.area ? `${project.area} م²` : null,
    },
    {
      icon: '🔑',
      label: lang === 'ar' ? 'عدد الوحدات' : 'Total Units',
      value: project.units ? `${project.units} ${lang === 'ar' ? 'وحدة' : 'units'}` : null,
    },
    {
      icon: '📅',
      label: lang === 'ar' ? 'سنة / تاريخ المشروع' : 'Project Year',
      value: project.year || null,
    },
    {
      icon: '🚀',
      label: lang === 'ar' ? 'تاريخ البدء' : 'Start Date',
      value: formatDate(project.start_date, lang),
    },
    {
      icon: '🏁',
      label: lang === 'ar' ? 'موعد التسليم المتوقع' : 'Expected Completion',
      value: formatDate(project.completion_date, lang),
    },
  ].filter(item => item.value);

  return (
    <>
      <SEO
        title={project.seo_title || title}
        description={project.seo_description || (description ? description.slice(0, 160) : title)}
        image={project.cover_image}
      />

      {/* ── Hero Gallery ── */}
      <div className="relative h-[75vh] min-h-[500px] overflow-hidden bg-dark">
        {galleryImages.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            effect="fade"
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop={galleryImages.length > 1}
            className="w-full h-full"
          >
            {galleryImages.map((img, i) => (
              <SwiperSlide key={i}>
                <div className="relative w-full h-full">
                  <img src={img} alt={`${title} - ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="w-full h-full bg-dark-300 flex items-center justify-center">
            <span className="text-8xl opacity-30">🏗️</span>
          </div>
        )}

        {/* Hero Overlay — Title & Status */}
        <div className="absolute bottom-12 left-0 right-0 z-20 pointer-events-none">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-4 pointer-events-auto">
                {/* Status badge — dynamic from DB */}
                <span className={`px-4 py-1.5 text-xs font-semibold border rounded-full backdrop-blur-md ${statusColor}`}>
                  {statusLabel}
                </span>
                {/* Category badge — dynamic from DB */}
                <span className="text-gray-300 text-xs font-medium bg-dark-200/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  {categoryLabel}
                </span>
                {/* Location badge — dynamic from DB */}
                {locationDisplay && (
                  <span className="text-gray-300 text-sm flex items-center gap-1.5 bg-dark-200/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {locationDisplay}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg tracking-tight font-arabic">
                {title}
              </h1>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Sticky Breadcrumb ── */}
      <div className="bg-dark-100/90 border-b border-white/10 py-4 sticky top-16 lg:top-20 z-40 backdrop-blur-md">
        <div className="container-custom flex items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2 truncate">
            <Link to="/" className="hover:text-gold transition-colors">{t('nav.home')}</Link>
            <span>/</span>
            <Link to="/projects" className="hover:text-gold transition-colors">{t('nav.projects')}</Link>
            <span>/</span>
            <span className="text-gold font-medium truncate">{title}</span>
          </div>
          <button
            onClick={sendToWhatsApp}
            className="hidden sm:flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-[#25D366] hover:bg-[#20ba58] text-white rounded-full transition-all"
          >
            {lang === 'ar' ? 'استفسار عبر واتساب' : 'WhatsApp Inquiry'}
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <section className="section-padding bg-dark relative z-10">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">

            {/* ── Left Column: Main Content ── */}
            <div className="lg:col-span-2 space-y-12">

              {/* Project Overview / Description */}
              {description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="card-luxury p-8"
                >
                  <h2 className="text-2xl font-bold text-white mb-3">
                    {lang === 'ar' ? 'نبذة عن المشروع' : 'Project Overview'}
                  </h2>
                  <div className="gold-divider mb-6" />
                  <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line font-arabic">
                    {description}
                  </p>
                </motion.div>
              )}

              {/* Progress Bar — always show if progress > 0, not just under_construction */}
              {project.progress != null && project.progress > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="card-luxury p-8 border-gold/30">
                    <h3 className="font-bold text-white mb-4 text-xl flex items-center justify-between">
                      <span>{lang === 'ar' ? 'نسبة إنجاز المشروع' : 'Construction Progress'}</span>
                      <span className="text-gold font-bold text-3xl font-english">{project.progress}%</span>
                    </h3>
                    <div className="w-full bg-dark-300 rounded-full h-3 overflow-hidden border border-white/10 p-0.5">
                      <motion.div
                        className="bg-gradient-to-r from-gold/80 to-gold h-full rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${project.progress}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        viewport={{ once: true }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {lang === 'ar'
                        ? `تم إنجاز ${project.progress}% من المشروع حتى الآن`
                        : `${project.progress}% of the project has been completed`}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Price Range */}
              {(project.price_from || project.price_to) && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <div className="card-luxury p-8 border-gold/20 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                        {lang === 'ar' ? 'نطاق الأسعار' : 'Price Range'}
                      </p>
                      <p className="text-2xl font-bold text-gold font-english">
                        {project.price_from
                          ? `${project.price_from.toLocaleString()} ${t('common.sar')}`
                          : ''}
                        {project.price_to
                          ? ` – ${project.price_to.toLocaleString()} ${t('common.sar')}`
                          : ''}
                      </p>
                    </div>
                    <button
                      onClick={sendToWhatsApp}
                      className="btn-gold px-6 py-3 text-xs uppercase tracking-wider font-semibold rounded-sm"
                    >
                      {lang === 'ar' ? 'طلب جدول الأسعار والخطة' : 'Request Price List'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Features & Amenities */}
              {featuresList.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {lang === 'ar' ? 'المميزات والخدمات الحصرية' : 'Exclusive Features & Amenities'}
                  </h3>
                  <div className="gold-divider mb-6" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    {featuresList.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 card-luxury border border-white/5 hover:border-gold/30 transition-colors">
                        <div className="w-9 h-9 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-200 font-medium text-sm">{feat}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Video Showcase */}
              {project.video_url && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {lang === 'ar' ? 'فيديو ترويجي للمشروع' : 'Project Video Showcase'}
                  </h3>
                  <div className="gold-divider mb-6" />
                  <div className="aspect-video w-full overflow-hidden rounded-sm border border-white/10 shadow-2xl">
                    <iframe
                      src={project.video_url.replace('watch?v=', 'embed/')}
                      title="Project Video"
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                </motion.div>
              )}

              {/* ── Project Location Map ── */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {lang === 'ar' ? 'موقع المشروع' : 'Project Location'}
                    </h3>
                    {locationDisplay && (
                      <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                        <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {locationDisplay}
                      </p>
                    )}
                  </div>
                  {/* Open in Google Maps button */}
                  <a
                    href={mapsOpenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    {lang === 'ar' ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}
                  </a>
                </div>
                <div className="gold-divider mb-4" />

                {mapEmbedUrl ? (
                  <div className="h-96 overflow-hidden rounded-sm border border-white/10 shadow-2xl relative bg-dark-300">
                    <iframe
                      src={mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`${title} — Project Location Map`}
                    />
                  </div>
                ) : (
                  // No location data available
                  <div className="h-48 rounded-sm border border-white/10 bg-dark-300 flex flex-col items-center justify-center gap-3 text-gray-500">
                    <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <p className="text-sm">
                      {lang === 'ar' ? 'الموقع غير متاح حالياً' : 'Location not available'}
                    </p>
                  </div>
                )}

                {/* Coordinate indicator if coordinates are set */}
                {project.latitude && project.longitude && (
                  <p className="text-xs text-gray-500 mt-2 text-center font-mono">
                    {project.latitude.toFixed(6)}, {project.longitude.toFixed(6)}
                  </p>
                )}
              </motion.div>
            </div>

            {/* ── Right Sidebar ── */}
            <div className="space-y-8">
              <motion.div
                className="card-luxury p-8 sticky top-32 border-gold/30"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="font-bold text-xl text-white mb-6 pb-4 border-b border-white/10">
                  {lang === 'ar' ? 'تفاصيل المشروع' : 'Project Specifications'}
                </h3>

                {/* Spec Items — all from DB */}
                <div className="space-y-5">
                  {specItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-full bg-dark-300 border border-white/10 flex items-center justify-center text-base flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                        <p className="text-white font-semibold text-sm">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* WhatsApp Inquiry Form */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <h4 className="font-bold text-white mb-1 text-sm">
                    {lang === 'ar' ? 'هل تود الاستفسار عن هذا المشروع؟' : 'Interested in this project?'}
                  </h4>
                  <p className="text-gray-400 text-xs mb-4">
                    {lang === 'ar'
                      ? 'تواصل مباشرة مع استشاري المبيعات للحصول على التفاصيل'
                      : 'Contact our sales consultant directly for details.'}
                  </p>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-300 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition-colors rounded-sm"
                    />
                    <input
                      type="tel"
                      placeholder={lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-300 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition-colors rounded-sm"
                    />
                    <textarea
                      rows={2}
                      placeholder={lang === 'ar' ? 'رسالتك أو استفسارك...' : 'Your inquiry message...'}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full px-4 py-3 bg-dark-300 border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition-colors rounded-sm resize-none"
                    />
                    <button
                      onClick={sendToWhatsApp}
                      className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba58] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] rounded-sm shadow-lg shadow-[#25D366]/20"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      {lang === 'ar' ? 'طلب استشارة عبر واتساب' : 'Consult via WhatsApp'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
