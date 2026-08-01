import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';
import { useLang } from '../../context/LanguageContext';

const WHATSAPP = '201103657888';
const WA_MSG = encodeURIComponent('مرحباً، أود طلب استشارة عقارية مع الهشام للتطوير العقاري');

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.1 },
  },
};

const slideUp = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.9 } },
};

export default function HeroSection() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const { settings } = useSettings();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const bgX = useTransform(mouseX, [-600, 600], ['-1.5%', '1.5%']);
  const bgY = useTransform(mouseY, [-400, 400], ['-1%', '1%']);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <section
      className="relative w-full h-screen min-h-[700px] overflow-hidden flex items-center pt-24 pb-16 bg-black"
      onMouseMove={handleMouseMove}
    >
      {/* Video & Image Background with Parallax & Slow Zoom */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ x: bgX, y: bgY, scale: 1.05 }}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1.03, opacity: 1 }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster={settings?.hero?.image_url || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=90"}
        >
          <source src={settings?.hero?.video_url || "https://cdn.pixabay.com/video/2021/08/11/84687-587216124_large.mp4"} type="video/mp4" />
        </video>
      </motion.div>

      {/* Luxury Gradient Overlays for High Legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/35 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 z-10" />

      {/* Gold Vertical Accent Line */}
      <motion.div
        className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-gold/40 to-transparent z-10"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.6, delay: 0.3 }}
      />

      {/* Hero Content Area */}
      <div className="container-custom relative z-20 w-full">
        <motion.div
          className="max-w-3xl"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Pre-title Luxury Badge */}
          <motion.div
            variants={fadeIn}
            className="inline-flex items-center gap-3 px-4 py-1.5 bg-black/60 border border-gold/30 backdrop-blur-md text-gold text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase mb-6"
          >
            <span className="w-4 h-px bg-gold" />
            {lang === 'ar' ? 'الهشام للتطوير العقاري' : 'AL HISHAM DEVELOPMENT'}
            <span className="w-4 h-px bg-gold" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={slideUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-5 tracking-tight"
          >
            {lang === 'ar' ? 'نصنع قيمة عقارية' : 'Creating Enduring'}
            <br />
            <span className="text-gradient-gold">
              {lang === 'ar' ? 'تدوم للأجيال' : 'Real Estate Value'}
            </span>
          </motion.h1>

          {/* Gold Architectural Divider */}
          <motion.div
            variants={slideUp}
            className="flex items-center gap-3 my-5"
          >
            <div className="h-px w-16 bg-gold" />
            <div className="w-2 h-2 bg-gold rotate-45" />
            <div className="h-px w-8 bg-gold/40" />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={slideUp}
            className="text-white/85 text-base sm:text-lg md:text-xl leading-relaxed mb-8 max-w-2xl font-light tracking-wide"
          >
            {lang === 'ar'
              ? 'شركة تطوير عقاري متخصصة في إبتكار وصناعة مشاريع عقارية استثنائية، تجمع بين الجودة، الجمال المعماري، والعائد الاستثماري المستدام.'
              : 'Premier real estate development firm crafting landmark residential & commercial destinations built on architectural quality and long-term value.'}
          </motion.p>

          {/* CTA Button Group - Simplified to 2 primary actions */}
          <motion.div variants={slideUp} className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full sm:w-auto">
            <Link
              to="/projects"
              className="btn-gold !px-8 !py-4 text-xs font-bold flex items-center justify-center gap-3 shadow-2xl hover:shadow-gold/30 transition-all flex-1 sm:flex-none"
            >
              <span>{t('hero.cta_projects')}</span>
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            <Link
              to="/contact"
              className="btn-outline !px-8 !py-4 text-xs font-bold flex items-center justify-center gap-3 flex-1 sm:flex-none"
            >
              <span>{t('hero.cta_consult')}</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Minimal Scroll Down Indicator */}
      <motion.div
        className="absolute bottom-8 inset-x-0 mx-auto w-max flex flex-col items-center justify-center gap-2 text-white/60 hover:text-gold transition-colors cursor-pointer z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        onClick={() => {
          window.scrollTo({ top: window.innerHeight * 0.9, behavior: 'smooth' });
        }}
      >
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase">{t('hero.scroll_down')}</span>
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-gold via-gold/40 to-transparent"
          animate={{ scaleY: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}
