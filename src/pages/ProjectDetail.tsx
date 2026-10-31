import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';

import { useLang } from '../context/LanguageContext';
import { projectsService } from '../services/projects';
import type { Project } from '../services/projects';
import { inquiriesService } from '../services/inquiries';
import SEO from '../components/ui/SEO';
import { useAuth } from '../context/AuthContext';
import { useBrochureModal } from '../context/BrochureModalContext';
import { formatUtmSummary, trackLeadEvent } from '../lib/utmTracker';

const WHATSAPP = '201103657888';

// ─────────────────────────────────────────────────────────────────
// Map Helpers
// ─────────────────────────────────────────────────────────────────
function buildMapEmbedUrl(project: Project, fallbackText: string): string | null {
  if (project.latitude && project.longitude) {
    return `https://maps.google.com/maps?q=${project.latitude},${project.longitude}&z=15&output=embed`;
  }
  if (project.google_maps_url) {
    const coordMatch = project.google_maps_url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=15&output=embed`;
    if (project.google_maps_url.includes('maps.google') || project.google_maps_url.includes('google.com/maps')) {
      if (project.google_maps_url.includes('output=embed')) return project.google_maps_url;
      const placeMatch = project.google_maps_url.match(/place\/([^/]+)/);
      if (placeMatch) return `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')))}&z=14&output=embed`;
    }
  }
  if (fallbackText?.trim()) return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackText)}&z=13&output=embed`;
  return null;
}

function buildMapsOpenUrl(project: Project, fallbackText: string): string {
  if (project.latitude && project.longitude) return `https://www.google.com/maps?q=${project.latitude},${project.longitude}`;
  if (project.google_maps_url) return project.google_maps_url;
  return `https://www.google.com/maps/search/${encodeURIComponent(fallbackText)}`;
}

// ─────────────────────────────────────────────────────────────────
// Config Maps
// ─────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  completed:          'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  under_construction: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  upcoming:           'bg-blue-500/20 text-blue-400 border-blue-500/30',
  sold_out:           'bg-red-500/20 text-red-400 border-red-500/30',
  planning:           'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const STATUS_DOT: Record<string, string> = {
  completed:          'bg-emerald-400',
  under_construction: 'bg-amber-400',
  upcoming:           'bg-blue-400',
  sold_out:           'bg-red-400',
  planning:           'bg-purple-400',
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

function formatDate(dateStr: string | undefined, lang: string): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long' });
  } catch { return dateStr; }
}

// ─────────────────────────────────────────────────────────────────
// Animated Progress Bar
// ─────────────────────────────────────────────────────────────────
function ProgressBar({ value, lang }: { value: number; lang: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <div ref={ref}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-[0.2em] text-gray-500 font-medium">
          {lang === 'ar' ? 'نسبة الإنجاز' : 'Construction Progress'}
        </span>
        <span className="text-2xl font-bold text-gold tabular-nums">
          {isInView ? value : 0}%
        </span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-gold/80 to-gold rounded-full"
          initial={{ width: 0 }}
          animate={{ width: isInView ? `${value}%` : '0%' }}
          transition={{ duration: 1.4, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Lightbox
// ─────────────────────────────────────────────────────────────────
function Lightbox({ images, index, onClose, lang }: { images: string[]; index: number; onClose: () => void; lang: string }) {
  const [current, setCurrent] = useState(index);
  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length);
  const next = () => setCurrent(i => (i + 1) % images.length);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        if (lang === 'ar') next(); else prev();
      }
      if (e.key === 'ArrowRight') {
        if (lang === 'ar') prev(); else next();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lang, onClose]);
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-white/60 hover:text-white text-3xl font-light z-10">✕</button>
        <div className="absolute top-6 left-6 text-white/40 text-sm font-mono">
          {current + 1} / {images.length}
        </div>
        <motion.img
          key={current}
          src={images[current]}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-h-[88vh] max-w-[90vw] object-contain rounded-lg"
          onClick={e => e.stopPropagation()}
        />
        {images.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); if (lang === 'ar') next(); else prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-all">
              ‹
            </button>
            <button onClick={e => { e.stopPropagation(); if (lang === 'ar') prev(); else next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-all">
              ›
            </button>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section Wrapper with fade-up animation
// ─────────────────────────────────────────────────────────────────
function Section({ children, className = '', id = '' }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref} id={id}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section Label
// ─────────────────────────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-6 h-px bg-gold" />
      <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium">{text}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Skeleton Loading
// ─────────────────────────────────────────────────────────────────
function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-ivory animate-pulse">
      <div className="h-[90vh] bg-forest/5" />
      <div className="container mx-auto px-6 py-20 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-forest/5 rounded-xl" />)}
        </div>
        <div className="space-y-3">
          <div className="h-6 bg-forest/5 rounded w-1/4" />
          <div className="h-4 bg-forest/5 rounded w-3/4" />
          <div className="h-4 bg-forest/5 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function ProjectDetail() {
  const { slug } = useParams();
  const { lang } = useLang();
  const { user, profile } = useAuth() as any;
  const isRtl = lang === 'ar';
  const { openBrochureModal } = useBrochureModal();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    message: '',
    submitted: false,
    error: '',
  });

  useEffect(() => {
    if (user && profile) {
      setContactForm(prev => ({
        ...prev,
        name: profile.full_name || prev.name,
        email: user.email || prev.email,
        phone: profile.phone || prev.phone,
      }));
    }
  }, [user, profile]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setErrorMsg('');
    setProject(null);
    projectsService.getProjectBySlug(slug)
      .then(async data => {
        setProject(data);
        setLoading(false);
        if (data?.category) {
          const all = await projectsService.getProjects();
          setRelatedProjects(all.filter(p => p.slug !== data.slug && p.status !== 'sold_out').slice(0, 3));
        }
      })
      .catch(() => {
        setErrorMsg(isRtl ? 'عذراً، لم نتمكن من العثور على هذا المشروع.' : 'Sorry, project not found.');
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <SkeletonLoader />;

  if (errorMsg || !project) {
    return (
      <div className="min-h-screen pt-40 pb-20 flex flex-col items-center justify-center bg-ivory text-forest text-center px-6">
        <div className="w-20 h-20 rounded-full border border-forest/15 flex items-center justify-center text-3xl mb-8">🏗</div>
        <h2 className="text-3xl font-bold text-forest mb-3 font-serif">{isRtl ? 'المشروع غير موجود' : 'Project Not Found'}</h2>
        <p className="text-forest/70 max-w-md mb-10 leading-relaxed font-sans">
          {errorMsg || (isRtl ? 'ربما تم تغيير رابط المشروع أو إزالته.' : 'This project may have been removed or relocated.')}
        </p>
        <Link to="/projects" className="inline-flex items-center gap-2 border border-forest/30 text-forest hover:bg-forest hover:text-ivory px-8 py-3 rounded-full text-sm font-semibold tracking-wider transition-all duration-300">
          {isRtl ? '← جميع المشاريع' : 'All Projects →'}
        </Link>
      </div>
    );
  }

  // ─── Data Bindings ────────────────────────────────────────────
  const title       = (isRtl ? project.title_ar : project.title_en) || project.title_ar || project.title_en || '';
  const titleOther  = (isRtl ? project.title_en : project.title_ar) || '';
  const desc        = (isRtl ? project.description_ar : project.description_en) || project.description_ar || project.description_en || '';
  const locationText = (isRtl ? project.location_ar : project.location_en) || project.location_ar || project.location_en || '';
  const address     = (isRtl ? (project as any).address_ar : (project as any).address_en) || '';
  const locationDisplay = (project as any).location_name || locationText || address || '';
  const statusLabel = STATUS_LABELS[project.status]?.[isRtl ? 'ar' : 'en'] || project.status || '';
  const statusColor = STATUS_COLORS[project.status] || 'bg-gold/20 text-gold border-gold/30';
  const statusDot   = STATUS_DOT[project.status] || 'bg-gold';
  const categoryLabel = CATEGORY_LABELS[project.category]?.[isRtl ? 'ar' : 'en'] || project.category || '';
  const mapEmbedUrl = buildMapEmbedUrl(project, locationDisplay);
  const mapsOpenUrl = buildMapsOpenUrl(project, locationDisplay);
  const startDate   = formatDate((project as any).start_date, lang);
  const endDate     = formatDate((project as any).completion_date, lang);
  const priceFrom   = (project as any).price_from;
  const priceTo     = (project as any).price_to;
  const expectedRoi = (project as any).expected_roi;
  const paymentPlan = isRtl ? (project as any).payment_plan_ar : (project as any).payment_plan_en;
  const brochureUrl = (project as any).brochure_url;
  const masterPlanUrl = (project as any).master_plan_url;

  const galleryImages: string[] = (() => {
    const fromRelation = (project as any).project_images;
    if (Array.isArray(fromRelation) && fromRelation.length > 0) return fromRelation.map((img: any) => img.image_url).filter(Boolean);
    if (project.cover_image) return [project.cover_image];
    return [];
  })();

  const featuresList: string[] = Array.isArray(project.features)
    ? project.features
    : typeof project.features === 'string'
    ? (project.features as string).split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const progress = typeof project.progress === 'number' ? project.progress : 0;
  const hasInvestorData = expectedRoi || paymentPlan || priceFrom || priceTo;
  const hasDocuments = brochureUrl || masterPlanUrl;
  const hasLocation = mapEmbedUrl || locationDisplay;
  const hasGallery = galleryImages.length > 0;


  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contactSubmitting) return;
    setContactSubmitting(true);
    setContactForm(prev => ({ ...prev, error: '' }));
    try {
      const fullMessage = (contactForm.message || '') + formatUtmSummary();
      await inquiriesService.createInquiry({
        user_id: user?.id || null,
        full_name: contactForm.name,
        email: contactForm.email || undefined,
        phone: contactForm.phone,
        project_id: project?.id || null,
        project_name: title || null,
        message: fullMessage.trim() || undefined,
      });

      trackLeadEvent('form_submission', {
        form_id: 'project_detail_contact',
        project_name: title,
      });

      setContactForm(prev => ({ ...prev, submitted: true }));
    } catch (err: any) {
      console.error('Inquiry submit error:', err);
      setContactForm(prev => ({
        ...prev,
        error: isRtl ? 'عذراً، حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.' : 'Sorry, failed to send request. Please try again.',
      }));
    } finally {
      setContactSubmitting(false);
    }
  };

  const navItems = [
    { id: 'overview', label: isRtl ? 'نظرة عامة' : 'Overview' },
    { id: 'details', label: isRtl ? 'التفاصيل' : 'Details' },
    ...(hasGallery ? [{ id: 'gallery', label: isRtl ? 'الصور' : 'Gallery' }] : []),
    ...(hasLocation ? [{ id: 'location', label: isRtl ? 'الموقع' : 'Location' }] : []),
    ...(hasInvestorData ? [{ id: 'investment', label: isRtl ? 'الاستثمار' : 'Investment' }] : []),
    { id: 'contact', label: isRtl ? 'التواصل' : 'Contact' },
  ];

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="bg-ivory text-forest min-h-screen" dir={isRtl ? 'rtl' : 'ltr'}>
      <SEO
        title={`${title} | AL HISHAM DEVELOPMENT`}
        description={desc?.slice(0, 155)}
        image={project.cover_image}
      />

      {lightboxIndex !== null && hasGallery && (
        <Lightbox images={galleryImages} index={lightboxIndex} onClose={() => setLightboxIndex(null)} lang={lang} />
      )}

      {/* ═══ 01 — CINEMATIC HERO ═══════════════════════════════ */}
      <div className="relative h-[90vh] min-h-[600px] overflow-hidden">
        {project.cover_image ? (
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
          >
            <img
              src={project.cover_image}
              alt={title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-dark-100 to-dark-300" />
        )}

        {/* Multi-layer overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-dark/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/40 to-transparent" />

        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="absolute top-24 w-full px-6 md:px-12"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-white/50">
            <Link to="/" className="hover:text-white/80 transition-colors">{isRtl ? 'الرئيسية' : 'Home'}</Link>
            <span>/</span>
            <Link to="/projects" className="hover:text-white/80 transition-colors">{isRtl ? 'المشاريع' : 'Projects'}</Link>
            <span>/</span>
            <span className="text-white/80 truncate max-w-[200px]">{title}</span>
          </div>
        </motion.div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-14 md:pb-20">
          <div className="max-w-7xl mx-auto">
            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-5"
            >
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase border ${statusColor}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot} animate-pulse`} />
                {statusLabel}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.8 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] tracking-tight mb-4 font-arabic"
            >
              {title}
            </motion.h1>
            {titleOther && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-white/30 text-lg md:text-xl mb-4 font-light tracking-wide"
              >
                {titleOther}
              </motion.p>
            )}

            {/* Location */}
            {locationDisplay && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="text-gold/80 text-base md:text-lg mb-8 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {locationDisplay}
              </motion.p>
            )}

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap gap-3"
            >
              <a href="#contact"
                className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-[#103C32] font-bold px-8 py-3.5 rounded-full text-sm tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(198,164,91,0.3)]"
              >
                {isRtl ? 'اطلب استشارة' : 'Request Consultation'}
              </a>
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(isRtl ? `مرحباً، أود الاستفسار عن مشروع: ${title}` : `Hello, I'm interested in project: ${title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white px-8 py-3.5 rounded-full text-sm tracking-wider transition-all duration-300 backdrop-blur-md"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                </svg>
                WhatsApp
              </a>
            </motion.div>
          </div>
        </div>

        {/* Progress ticker at hero bottom */}
        {progress > 0 && project.status !== 'completed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-white/10"
          >
            <motion.div
              className="h-full bg-gold"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.8, delay: 1.2, ease: [0.25, 1, 0.5, 1] }}
            />
          </motion.div>
        )}
      </div>

      {/* ═══ MINI NAV ═══════════════════════════════════════════ */}
      <div className="sticky top-16 lg:top-20 z-40 bg-ivory/90 border-b border-forest/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-0 py-0 min-w-max">
            {navItems.map(item => (
              <a key={item.id} href={`#${item.id}`}
                className="px-5 py-4 text-xs font-semibold tracking-widest uppercase text-forest/70 hover:text-forest border-b-2 border-transparent hover:border-gold transition-all whitespace-nowrap font-sans"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">

        {/* ═══ 02 — QUICK FACTS GRID ════════════════════════════ */}
        <Section id="details" className="py-16 border-b border-forest/10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              project.status && {
                label: isRtl ? 'حالة المشروع' : 'Project Status',
                value: statusLabel,
                color: true,
              },
              project.category && {
                label: isRtl ? 'نوع المشروع' : 'Project Type',
                value: categoryLabel,
              },
              project.area && {
                label: isRtl ? 'المساحة الإجمالية' : 'Total Area',
                value: `${Number(project.area).toLocaleString()} ${isRtl ? 'م²' : 'm²'}`,
              },
              project.units && {
                label: isRtl ? 'عدد الوحدات' : 'Total Units',
                value: `${project.units} ${isRtl ? 'وحدة' : 'units'}`,
              },
              startDate && {
                label: isRtl ? 'تاريخ البدء' : 'Start Date',
                value: startDate,
              },
              endDate && {
                label: isRtl ? 'التسليم المتوقع' : 'Expected Completion',
                value: endDate,
              },
              project.year && {
                label: isRtl ? 'سنة المشروع' : 'Project Year',
                value: String(project.year),
              },
              (priceFrom || priceTo) && {
                label: isRtl ? 'نطاق السعر' : 'Price Range',
                value: priceFrom && priceTo
                  ? `${Number(priceFrom).toLocaleString()} – ${Number(priceTo).toLocaleString()}`
                  : priceFrom ? `${isRtl ? 'من' : 'From'} ${Number(priceFrom).toLocaleString()}`
                  : `${isRtl ? 'حتى' : 'Up to'} ${Number(priceTo).toLocaleString()}`,
              },
            ].filter(Boolean).map((item: any, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white border border-forest/10 rounded-2xl p-6 shadow-sm flex flex-col gap-1.5"
              >
                <span className="text-[11px] uppercase tracking-[0.2em] text-forest/60 font-medium font-sans">{item.label}</span>
                <span className={`text-base font-semibold ${item.color ? 'text-gold' : 'text-forest'} font-serif`}>{item.value}</span>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ═══ 03 — PROJECT OVERVIEW ═══════════════════════════ */}
        {desc && (
          <Section id="overview" className="py-20 border-b border-forest/10">
            <div className="grid lg:grid-cols-[200px_1fr] gap-12 items-start">
              <div>
                <SectionLabel text={isRtl ? '٠١ — نظرة عامة' : '01 — Overview'} />
                <h2 className="text-3xl md:text-4xl font-bold text-forest leading-tight font-serif">
                  {isRtl ? 'عن المشروع' : 'About The Project'}
                </h2>
              </div>
              <div className="space-y-5">
                {desc.split('\n').filter(Boolean).map((para, i) => (
                  <p key={i} className="text-forest/80 leading-relaxed text-base md:text-lg font-sans font-light">{para}</p>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* ═══ 04 — TIMELINE & PROGRESS ════════════════════════ */}
        {(startDate || endDate || progress > 0) && (
          <Section className="py-20 border-b border-forest/10">
            <SectionLabel text={isRtl ? '٠٢ — مراحل المشروع' : '02 — Project Timeline'} />
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Timeline */}
              {(startDate || endDate) && (
                <div>
                  <h2 className="text-2xl font-bold text-forest mb-10 font-serif">{isRtl ? 'الجدول الزمني' : 'Project Timeline'}</h2>
                  <div className="relative">
                    <div className="absolute top-0 bottom-0 start-[17px] w-px bg-forest/15" />
                    <div className="space-y-8">
                      {startDate && (
                        <div className="flex gap-5 items-start">
                          <div className="w-9 h-9 rounded-full border border-gold/50 bg-gold/10 flex items-center justify-center flex-shrink-0 z-10">
                            <div className="w-2 h-2 rounded-full bg-gold" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-forest/60 mb-1 font-sans">{isRtl ? 'بداية المشروع' : 'Project Start'}</p>
                            <p className="text-forest font-semibold text-lg font-serif">{startDate}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-5 items-start">
                        <div className={`w-9 h-9 rounded-full border flex items-center justify-center flex-shrink-0 z-10 ${statusColor}`}>
                          <div className={`w-2 h-2 rounded-full ${statusDot} animate-pulse`} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-forest/60 mb-1 font-sans">{isRtl ? 'الحالة الحالية' : 'Current Status'}</p>
                          <p className="text-forest font-semibold text-lg font-serif">{statusLabel}</p>
                        </div>
                      </div>
                      {endDate && (
                        <div className="flex gap-5 items-start opacity-70">
                          <div className="w-9 h-9 rounded-full border border-forest/20 bg-forest/5 flex items-center justify-center flex-shrink-0 z-10">
                            <div className="w-2 h-2 rounded-full bg-forest/40" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-forest/60 mb-1 font-sans">{isRtl ? 'التسليم المتوقع' : 'Expected Completion'}</p>
                            <p className="text-forest font-semibold text-lg font-serif">{endDate}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Progress: One Green Way Construction Report Card */}
              {progress > 0 && (
                <div className="border border-forest/10 p-8 rounded-2xl relative overflow-hidden bg-white shadow-sm">
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[11px] uppercase tracking-[0.2em] text-forest/70 font-semibold font-sans">
                          {isRtl ? 'تقرير الإنجاز الإنشائي' : 'Construction Progress Report'}
                        </span>
                        <span className="text-xs px-3 py-1 rounded-full bg-[#103C32]/10 text-forest border border-forest/20 font-medium font-sans">
                          {project.status === 'completed' ? (isRtl ? 'مكتمل' : 'Completed') : (isRtl ? 'قيد التنفيذ' : 'In Progress')}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl md:text-6xl font-light text-forest font-serif">
                          {progress}
                        </span>
                        <span className="text-3xl italic text-gold font-serif">%</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-forest/10">
                      <div className="w-full bg-forest/10 h-2 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-gradient-to-r from-[#103C32] via-gold to-[#103C32] rounded-full transition-all duration-1000"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-forest/70 leading-relaxed font-sans font-light">
                        {isRtl
                          ? `تم إنجاز ${progress}% من الأعمال الإنشائية والمرافق المعمارية المتطورة وفق أعلى معايير الجودة المعتمدة.`
                          : `${progress}% of architectural and structural execution completed following the highest luxury standards.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ═══ 05 — GALLERY ═══════════════════════════════════ */}
        {hasGallery && (
          <Section id="gallery" className="py-20 border-b border-forest/10">
            <SectionLabel text={isRtl ? '٠٣ — معرض الصور' : '03 — Gallery'} />
            <h2 className="text-3xl md:text-4xl font-bold text-forest mb-10 font-serif">{isRtl ? 'صور المشروع' : 'Project Photos'}</h2>

            {galleryImages.length === 1 ? (
              <div className="cursor-zoom-in group relative rounded-xl overflow-hidden" onClick={() => setLightboxIndex(0)}>
                <img src={galleryImages[0]} alt={title} className="w-full h-[60vh] object-cover group-hover:scale-[1.02] transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-sm border border-white/40 px-4 py-2 rounded-full backdrop-blur-sm transition-all">
                    {isRtl ? 'عرض الصورة' : 'View Full'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {galleryImages.map((img, i) => (
                  <motion.div
                    key={i}
                    className={`cursor-zoom-in group relative rounded-xl overflow-hidden ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
                    style={{ aspectRatio: i === 0 ? '16/9' : '4/3' }}
                    onClick={() => setLightboxIndex(i)}
                    whileHover={{ scale: 1.005 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={img}
                      alt={`${title} ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading={i < 3 ? 'eager' : 'lazy'}
                    />
                    <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/30 transition-colors duration-300" />
                    {i === galleryImages.length - 1 && galleryImages.length > 6 && (
                      <div className="absolute inset-0 bg-dark/60 flex items-center justify-center">
                        <span className="text-white font-semibold text-xl">+{galleryImages.length - 6} {isRtl ? 'صور' : 'more'}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* ═══ 06 — FEATURES & AMENITIES ═══════════════════════ */}
        {featuresList.length > 0 && (
          <Section className="py-20 border-b border-forest/10">
            <SectionLabel text={isRtl ? '٠٤ — المميزات' : '04 — Features'} />
            <h2 className="text-3xl md:text-4xl font-bold text-forest mb-10 font-serif">{isRtl ? 'مميزات المشروع' : 'Project Features'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {featuresList.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 bg-white border border-forest/10 rounded-xl px-4 py-3.5 group hover:border-gold/50 shadow-sm transition-colors"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                  <span className="text-sm text-forest/80 group-hover:text-forest transition-colors font-sans">{feature}</span>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* ═══ 07 — INVESTMENT OVERVIEW ════════════════════════ */}
        {hasInvestorData && (
          <Section id="investment" className="py-20 border-b border-forest/10">
            <SectionLabel text={isRtl ? '٠٥ — الاستثمار' : '05 — Investment'} />
            <h2 className="text-3xl md:text-4xl font-bold text-forest mb-10 font-serif">{isRtl ? 'نظرة استثمارية' : 'Investment Overview'}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {expectedRoi && (
                <div className="bg-white border border-gold/30 rounded-2xl p-8 hover:border-gold shadow-sm transition-colors">
                  <p className="text-[10px] uppercase tracking-widest text-forest/60 mb-2 font-sans">{isRtl ? 'العائد المتوقع' : 'Expected ROI'}</p>
                  <p className="text-3xl font-bold text-gold font-serif">{expectedRoi}</p>
                </div>
              )}
              {(priceFrom || priceTo) && (
                <div className="bg-white border border-forest/10 rounded-2xl p-8 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest text-forest/60 mb-2 font-sans">{isRtl ? 'نطاق الأسعار' : 'Price Range'}</p>
                  <p className="text-2xl font-bold text-forest font-serif">
                    {priceFrom && `${Number(priceFrom).toLocaleString()}`}
                    {priceFrom && priceTo && <span className="text-forest/40 mx-2">—</span>}
                    {priceTo && `${Number(priceTo).toLocaleString()}`}
                  </p>
                </div>
              )}
              {paymentPlan && (
                <div className="bg-white border border-forest/10 rounded-2xl p-8 md:col-span-2 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest text-forest/60 mb-3 font-sans">{isRtl ? 'خطة الدفع' : 'Payment Plan'}</p>
                  <p className="text-forest/80 leading-relaxed font-sans">{paymentPlan}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ═══ 08 — LOCATION & MAP ═════════════════════════════ */}
        {hasLocation && (
          <Section id="location" className="py-20 border-b border-forest/10">
            <SectionLabel text={isRtl ? '٠٦ — الموقع' : '06 — Location'} />
            <h2 className="text-3xl md:text-4xl font-bold text-forest mb-10 font-serif">{isRtl ? 'موقع المشروع' : 'Project Location'}</h2>
            <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
              {/* Map */}
              {mapEmbedUrl && (
                <div className="rounded-2xl overflow-hidden border border-forest/10 bg-white shadow-sm">
                  <iframe
                    src={mapEmbedUrl}
                    width="100%"
                    height="420"
                    style={{ border: 0, display: 'block' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${title} location map`}
                  />
                </div>
              )}
              {/* Location Info Card */}
              <div className="bg-white border border-forest/10 rounded-2xl p-8 space-y-6 shadow-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-forest/60 mb-2 font-sans">{isRtl ? 'اسم الموقع' : 'Location'}</p>
                  <p className="text-forest font-semibold text-lg font-serif">{locationDisplay}</p>
                </div>
                {address && address !== locationDisplay && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-forest/60 mb-2 font-sans">{isRtl ? 'العنوان التفصيلي' : 'Detailed Address'}</p>
                    <p className="text-forest/80 text-sm leading-relaxed font-sans">{address}</p>
                  </div>
                )}
                {project.latitude && project.longitude && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-forest/60 mb-2 font-sans">{isRtl ? 'الإحداثيات' : 'Coordinates'}</p>
                    <p className="text-forest/60 text-xs font-mono" dir="ltr">{project.latitude}, {project.longitude}</p>
                  </div>
                )}
                <a
                  href={mapsOpenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 border border-forest/20 hover:border-forest text-forest hover:bg-forest hover:text-ivory px-5 py-3 rounded-full text-sm font-semibold transition-all duration-300 font-sans"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {isRtl ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}
                </a>
              </div>
            </div>
          </Section>
        )}

        {/* ═══ 09 — DOCUMENTS ══════════════════════════════════ */}
        {hasDocuments && (
          <Section className="py-20 border-b border-forest/10">
            <SectionLabel text={isRtl ? '٠٧ — المستندات' : '07 — Documents'} />
            <h2 className="text-3xl font-bold text-forest mb-10 font-serif">
              {isRtl ? 'وثائق المشروع الحصرية' : 'Exclusive Project Documents'}
            </h2>
            <div className="flex flex-wrap gap-4">
              {brochureUrl && (
                <button
                  type="button"
                  onClick={() =>
                    openBrochureModal({
                      projectName: title,
                      projectId: project.id,
                      brochureUrl,
                      masterplanUrl: masterPlanUrl,
                      defaultType: 'brochure',
                    })
                  }
                  className="flex items-center gap-4 bg-white border border-forest/10 hover:border-gold px-6 py-4 rounded-2xl group transition-all cursor-pointer text-left rtl:text-right shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-forest/5 border border-forest/10 flex items-center justify-center text-forest text-xl group-hover:scale-105 transition-transform">
                    📄
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-forest group-hover:text-gold transition-colors font-sans">
                      {isRtl ? 'تحميل كتيب المشروع (Brochure)' : 'Download Brochure'}
                    </p>
                    <p className="text-xs text-forest/60 font-sans">PDF • {isRtl ? 'تحميل فوري معتمد' : 'Instant VIP Access'}</p>
                  </div>
                </button>
              )}
              {masterPlanUrl && (
                <button
                  type="button"
                  onClick={() =>
                    openBrochureModal({
                      projectName: title,
                      projectId: project.id,
                      brochureUrl,
                      masterplanUrl: masterPlanUrl,
                      defaultType: 'masterplan',
                    })
                  }
                  className="flex items-center gap-4 bg-white border border-forest/10 hover:border-gold px-6 py-4 rounded-2xl group transition-all cursor-pointer text-left rtl:text-right shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-forest/5 border border-forest/10 flex items-center justify-center text-forest text-xl group-hover:scale-105 transition-transform">
                    🗺
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-forest group-hover:text-gold transition-colors font-sans">
                      {isRtl ? 'تحميل المخطط العام (Master Plan)' : 'Download Master Plan'}
                    </p>
                    <p className="text-xs text-forest/60 font-sans">
                      PDF / Layout • {isRtl ? 'عرض التقسيمات والمساحات' : 'Floor Plans & Layouts'}
                    </p>
                  </div>
                </button>
              )}
            </div>
          </Section>
        )}

        {/* ═══ 10 — CONTACT / CTA ══════════════════════════════ */}
        <Section id="contact" className="py-20 border-b border-forest/10">
          <div className="grid lg:grid-cols-[1fr_480px] gap-16 items-start">
            {/* Left: Description */}
            <div>
              <SectionLabel text={isRtl ? '٠٨ — تواصل معنا' : '08 — Contact'} />
              <h2 className="text-3xl md:text-5xl font-bold text-forest mb-6 leading-tight font-serif">
                {isRtl ? 'مهتم بهذا المشروع؟' : 'Interested in This Project?'}
              </h2>
              <p className="text-forest/70 leading-relaxed mb-8 font-sans">
                {isRtl
                  ? 'تواصل مع فريقنا الاستثماري للحصول على معلومات مفصلة حول المشروع وخيارات التملك.'
                  : 'Connect with our investment team to get detailed information about the project and ownership options.'}
              </p>
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(isRtl ? `مرحباً، أود الاستفسار عن مشروع: ${title}` : `Hello, I'm interested in project: ${title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20ba58] text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-[0_4px_20px_rgba(37,211,102,0.25)] font-sans"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                </svg>
                {isRtl ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
              </a>
            </div>

            {/* Right: Contact Form */}
            <div className="bg-white border border-forest/10 rounded-2xl p-8 shadow-md">
              {contactForm.submitted ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4 text-[#103C32]">✓</div>
                  <h3 className="text-xl font-bold text-forest mb-2 font-serif">{isRtl ? 'تم إرسال طلبك' : 'Request Sent'}</h3>
                  <p className="text-forest/70 text-sm font-sans">{isRtl ? 'سيتواصل معك فريقنا قريباً.' : 'Our team will reach out shortly.'}</p>
                </div>
              ) : (
                <form
                  onSubmit={handleContactSubmit}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-bold text-forest mb-6 font-serif">{isRtl ? 'اطلب استشارة مجانية' : 'Request a Free Consultation'}</h3>
                  <input type="hidden" value={title} />
                  {[
                    { name: 'name', label: isRtl ? 'الاسم الكامل' : 'Full Name', type: 'text', required: true },
                    { name: 'email', label: isRtl ? 'البريد الإلكتروني' : 'Email', type: 'email', required: false },
                    { name: 'phone', label: isRtl ? 'رقم الهاتف' : 'Phone Number', type: 'tel', required: true },
                  ].map(field => (
                    <div key={field.name}>
                      <label className="block text-xs text-forest/70 uppercase tracking-widest mb-1.5 font-sans font-medium">{field.label}</label>
                      <input
                        type={field.type}
                        required={field.required}
                        value={(contactForm as any)[field.name]}
                        onChange={e => setContactForm(prev => ({ ...prev, [field.name]: e.target.value }))}
                        className="w-full bg-ivory/60 border border-forest/15 rounded-xl px-4 py-3 text-forest text-sm focus:outline-none focus:border-forest transition-colors placeholder-forest/40 font-sans"
                        readOnly={!!user && field.name !== 'message'}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs text-forest/70 uppercase tracking-widest mb-1.5 font-sans font-medium">{isRtl ? 'رسالتك (اختياري)' : 'Message (Optional)'}</label>
                    <textarea
                      rows={3}
                      value={contactForm.message}
                      onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full bg-ivory/60 border border-forest/15 rounded-xl px-4 py-3 text-forest text-sm focus:outline-none focus:border-forest transition-colors placeholder-forest/40 resize-none font-sans"
                      placeholder={isRtl ? 'أخبرنا ما الذي يهمك في هذا المشروع...' : 'Tell us what interests you about this project...'}
                    />
                  </div>
                  {contactForm.error && (
                    <p className="text-red-500 text-xs font-sans">{contactForm.error}</p>
                  )}
                  <button type="submit" disabled={contactSubmitting}
                    className="w-full bg-[#103C32] hover:bg-[#0c2c24] text-white font-bold py-4 rounded-full text-sm tracking-wider transition-all shadow-[0_4px_20px_rgba(16,60,50,0.25)] disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2 font-sans"
                  >
                    {contactSubmitting ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {isRtl ? 'جاري الإرسال...' : 'Sending...'}</>
                    ) : (
                      isRtl ? 'إرسال الطلب' : 'Send Request'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </Section>

        {/* ═══ 11 — RELATED PROJECTS ═══════════════════════════ */}
        {relatedProjects.length > 0 && (
          <Section className="py-20">
            <SectionLabel text={isRtl ? 'اكتشف أيضاً' : 'Explore More'} />
            <h2 className="text-3xl font-bold text-forest mb-10 font-serif">{isRtl ? 'مشاريع أخرى' : 'Other Projects'}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.map((p, i) => {
                const rTitle = (isRtl ? p.title_ar : p.title_en) || p.title_ar || '';
                const rLoc = (isRtl ? p.location_ar : p.location_en) || p.location_ar || '';
                const rStatus = STATUS_LABELS[p.status]?.[isRtl ? 'ar' : 'en'] || p.status;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link to={`/projects/${p.slug}`} className="group block bg-white border border-forest/10 hover:border-gold/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="h-48 overflow-hidden bg-forest/5 relative">
                        {p.cover_image ? (
                          <img src={p.cover_image} alt={rTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">🏗</div>
                        )}
                        <div className="absolute top-3 end-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-forest group-hover:bg-[#103C32] group-hover:text-gold transition-colors">
                          <svg className={`w-3.5 h-3.5 transform ${isRtl ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="text-xs text-gold uppercase tracking-widest mb-2 font-sans font-medium">{rStatus}</p>
                        <h3 className="font-bold text-forest group-hover:text-gold transition-colors mb-1 font-serif text-lg">{rTitle}</h3>
                        {rLoc && <p className="text-xs text-forest/60 font-sans">{rLoc}</p>}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
