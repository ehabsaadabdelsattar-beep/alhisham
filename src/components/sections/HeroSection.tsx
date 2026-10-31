import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlay, FiArrowUpRight, FiCompass, FiChevronDown } from 'react-icons/fi';
import LuxuryButton from '../ui/LuxuryButton';
import { useSettings } from '../../context/SettingsContext';
import { useLang } from '../../context/LanguageContext';
import { useVideoModal } from '../../context/VideoModalContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const { t } = useTranslation();
  const { lang, isRTL } = useLang();
  const { settings } = useSettings();
  const { openVideo } = useVideoModal();

  const sectionRef = useRef<HTMLElement>(null);
  const bgWrapperRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const videoCardRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  // High-resolution architectural photography & video
  const heroPoster = settings?.hero?.image_url || '/images/hisham_hero_villa.jpg';
  const heroVideo = settings?.hero?.video_url || 'https://cdn.pixabay.com/video/2021/08/11/84687-587216124_large.mp4';

  const handleOpenVideoTour = () => {
    openVideo({
      src: heroVideo,
      title: lang === 'ar' ? 'جولة سينمائية في مشاريع الهشام' : 'Al Hisham Developments — Cinematic Tour',
      poster: heroPoster,
    });
  };

  const handleScrollToProjects = () => {
    const el = document.getElementById('projects') || document.querySelector('.residences-section') || document.querySelector('section:nth-of-type(2)');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight * 0.95, behavior: 'smooth' });
    }
  };

  // GSAP Master Timeline & ScrollTrigger Parallax
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // 1. Initial Master Entrance Timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Background cinematic zoom & reveal
      if (bgImageRef.current) {
        tl.fromTo(
          bgImageRef.current,
          { scale: 1.15, opacity: 0 },
          { scale: 1.02, opacity: 1, duration: 1.8, ease: 'power2.out' }
        );
      }

      // Brand badge
      if (badgeRef.current) {
        tl.fromTo(
          badgeRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=1.2'
        );
      }

      // Headline
      if (headlineRef.current) {
        tl.fromTo(
          headlineRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1 },
          '-=0.6'
        );
      }

      // Subtitle
      if (subtitleRef.current) {
        tl.fromTo(
          subtitleRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.6'
        );
      }

      // Action Buttons
      if (buttonsRef.current) {
        tl.fromTo(
          buttonsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.5'
        );
      }

      // Floating Video Tour Card
      if (videoCardRef.current) {
        tl.fromTo(
          videoCardRef.current,
          { opacity: 0, y: 45, scale: 0.92 },
          { opacity: 1, y: 0, scale: 1, duration: 1 },
          '-=0.7'
        );

        // Continuous subtle luxury floating animation (idle loop)
        gsap.to(videoCardRef.current, {
          y: '-=8',
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.2,
        });
      }

      // Scroll Down Pill
      if (scrollIndicatorRef.current) {
        tl.fromTo(
          scrollIndicatorRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.7 },
          '-=0.4'
        );
      }

      // 2. ScrollTrigger Parallax on Scroll (Cinematic depth)
      if (bgImageRef.current) {
        gsap.to(bgImageRef.current, {
          yPercent: 18,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // Hero Content Fade & Lift on Scroll
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          y: -50,
          opacity: 0.25,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '75% top',
            scrub: true,
          },
        });
      }
    }, section);

    // 3. Subtle Interactive Mouse Tilt on Desktop
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024 || !videoCardRef.current || !bgImageRef.current) return;
      const { innerWidth, innerHeight } = window;
      const xNorm = (e.clientX / innerWidth - 0.5) * 2;
      const yNorm = (e.clientY / innerHeight - 0.5) * 2;

      gsap.to(videoCardRef.current, {
        x: -xNorm * 12,
        y: -yNorm * 10,
        duration: 0.6,
        ease: 'power1.out',
        overwrite: 'auto',
      });

      gsap.to(bgImageRef.current, {
        x: xNorm * 8,
        y: yNorm * 8,
        duration: 0.8,
        ease: 'power1.out',
        overwrite: 'auto',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen min-h-[700px] max-h-[1100px] overflow-hidden flex items-end pb-16 sm:pb-20 lg:pb-24 pt-24 bg-[#0a1a16] select-none"
    >
      {/* 
        1. CINEMATIC ARCHITECTURAL BACKGROUND (GSAP Controlled)
        Preserves natural golden hour lighting, clear turquoise pool, and warm interior illumination.
      */}
      <div
        ref={bgWrapperRef}
        className="absolute inset-0 z-0 overflow-hidden"
      >
        <img
          ref={bgImageRef}
          src={heroPoster}
          alt="Al Hisham Luxury Architecture"
          className="w-full h-full object-cover object-center will-change-transform"
          loading="eager"
        />

        {/* Ambient Top Vignette for Navbar Legibility */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black/60 via-black/25 to-transparent pointer-events-none" />

        {/* 
          Selective Directional Gradient Overlay:
          Only dims the text area so text has pristine contrast,
          leaving 70%+ of the architectural villa and pool crystal clear!
        */}
        <div
          className={`absolute inset-0 pointer-events-none ${
            isRTL
              ? 'bg-gradient-to-l from-black/75 via-black/40 via-40% to-transparent'
              : 'bg-gradient-to-r from-black/75 via-black/40 via-40% to-transparent'
          }`}
        />

        {/* Ambient Bottom Gradient for Smooth Transition */}
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#0C2C24] via-black/40 to-transparent pointer-events-none" />
      </div>

      {/* 2. HERO CONTENT CONTAINER (GSAP Controlled) */}
      <div
        ref={contentRef}
        className="container-custom relative z-10 w-full will-change-transform"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          
          {/* Main Editorial Text Column (8 cols) */}
          <div className="lg:col-span-8 max-w-3xl">
            {/* Subtle Brand Tag */}
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/40 border border-white/20 backdrop-blur-md text-ivory text-xs font-medium tracking-widest uppercase mb-5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span className="font-sans font-medium text-gold/90">
                {lang === 'ar' ? 'الهشام للتطوير العقاري' : 'AL HISHAM DEVELOPMENTS'}
              </span>
              <span className="text-white/30">•</span>
              <span className="text-ivory/80 text-[11px]">
                {lang === 'ar' ? 'مشاريع معمارية استثنائية' : 'LUXURY RESIDENCES'}
              </span>
            </div>

            {/* Editorial Headline */}
            <h1
              ref={headlineRef}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] text-white leading-[1.18] sm:leading-[1.14] tracking-tight mb-5 drop-shadow-md"
            >
              {lang === 'ar' ? (
                <span className="font-arabic font-normal">
                  حيث تلتقي{' '}
                  <span className="text-gold font-medium font-readex text-[1.05em] inline-block px-1">
                    الفخامة
                  </span>
                  ،{' '}
                  <span className="text-ivory font-light font-readex">
                    الطبيعة
                  </span>
                  ،
                  <br className="hidden sm:inline" />
                  <span className="text-ivory font-light font-readex me-2">والإرث</span>
                  <span className="text-gold font-medium font-readex text-[1.05em] inline-block">
                    المعماري
                  </span>
                </span>
              ) : (
                <span className="font-serif">
                  Where{' '}
                  <span className="font-editorial italic font-normal text-gold text-[1.08em]">
                    nature
                  </span>
                  ,{' '}
                  <span className="font-editorial italic font-normal text-gold text-[1.08em]">
                    luxury
                  </span>
                  ,
                  <br />
                  and{' '}
                  <span className="font-editorial italic font-normal text-gold text-[1.08em]">
                    legacy
                  </span>{' '}
                  meet
                </span>
              )}
            </h1>

            {/* Subtitle Description */}
            <p
              ref={subtitleRef}
              className="text-ivory/90 text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-2xl mb-8 font-sans drop-shadow-sm"
            >
              {lang === 'ar'
                ? 'نبتكر مجتمعات ومشاريع سكنية وتجارية استثنائية، تجمع بين الرقي المعماري، جودة الحياة الهادئة، والعائد الاستثماري المستدام.'
                : 'Discover state-of-the-art residences crafted to the highest international standards, setting the benchmark for luxury architectural living.'}
            </p>

            {/* Call To Action Buttons */}
            <div
              ref={buttonsRef}
              className="flex flex-wrap items-center gap-4 pt-1"
            >
              <LuxuryButton
                to="/projects"
                variant="gold"
                text={lang === 'ar' ? 'استكشف المشاريع' : 'Explore Residences'}
                icon={<FiArrowUpRight className="w-4 h-4 rtl:rotate-180" />}
                className="!px-7 sm:!px-9 !py-3.5 sm:!py-4 text-xs sm:text-sm font-semibold !rounded-full shadow-xl hover:shadow-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              />

              <LuxuryButton
                to="/contact"
                variant="white"
                text={lang === 'ar' ? 'حجز موعد زيارة' : 'Plan Your Visit'}
                className="!px-7 sm:!px-8 !py-3.5 sm:!py-4 text-xs sm:text-sm font-medium !rounded-full !bg-white/90 hover:!bg-white !text-forest border-0 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all backdrop-blur-md"
              />
            </div>
          </div>

          {/* 
            3. FLOATING ARCHITECTURAL VIDEO CARD (Bottom Right, GSAP Controlled)
            Matches the reference layout: horizontal pill with video thumbnail, 
            circular play button, title and short description.
          */}
          <div
            ref={videoCardRef}
            className="lg:col-span-4 hidden lg:flex justify-end will-change-transform"
          >
            <div
              onClick={handleOpenVideoTour}
              role="button"
              tabIndex={0}
              className="group relative flex items-center gap-4 p-3 rounded-2xl bg-black/45 hover:bg-black/60 backdrop-blur-xl border border-white/20 hover:border-gold/60 shadow-2xl transition-all duration-300 cursor-pointer max-w-sm w-full"
            >
              {/* 16:9 Thumbnail with Center Play Button */}
              <div className="relative w-32 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-gold/40 transition-colors">
                <img
                  src={heroPoster}
                  alt="Video Tour Preview"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors" />
                
                {/* Glowing Circular Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/90 group-hover:bg-gold text-forest flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300">
                    <FiPlay className="w-3.5 h-3.5 fill-current ms-0.5 text-forest group-hover:text-forest-dark" />
                  </div>
                </div>
              </div>

              {/* Text Information */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="text-white text-xs sm:text-sm font-semibold tracking-wide truncate group-hover:text-gold transition-colors font-sans">
                    {lang === 'ar' ? 'اكتشف مشاريع الهشام' : 'Discover Al Hisham'}
                  </h4>
                </div>
                <p className="text-ivory/70 text-[11px] leading-relaxed line-clamp-2 font-light font-sans">
                  {lang === 'ar'
                    ? 'عِش تجربة الحياة المعمارية الفاخرة وأسلوب العيش الاستثنائي.'
                    : "Experience exclusive luxury resort and architectural living."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 
        4. BOTTOM FLOATING CONTROLS
        Architectural locator & scroll prompt (GSAP Controlled)
      */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-6 sm:bottom-8 start-6 sm:start-10 z-20 hidden md:flex items-center gap-3"
      >
        <button
          onClick={handleScrollToProjects}
          aria-label="Scroll to residences"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 hover:bg-black/50 border border-white/15 text-ivory/70 hover:text-gold text-xs transition-all backdrop-blur-md"
        >
          <FiCompass className="w-3.5 h-3.5 text-gold animate-spin-slow" />
          <span className="text-[11px] font-sans">
            {lang === 'ar' ? 'استكشف المشاريع' : 'Residences'}
          </span>
          <FiChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
}
