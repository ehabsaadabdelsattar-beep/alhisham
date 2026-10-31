import React, { useRef, useEffect, useState } from 'react';
import { useLang } from '../../context/LanguageContext';
import { useVideoModal } from '../../context/VideoModalContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiPlay, FiVolume2, FiVolumeX, FiMaximize2 } from 'react-icons/fi';
import EditorialText from '../ui/EditorialText';

gsap.registerPlugin(ScrollTrigger);

export default function LifestyleSection() {
  const { lang, isRTL } = useLang();
  const { openVideo } = useVideoModal();
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const lifestylePillars = [
    {
      number: '01',
      title_ar: 'تناغم الطبيعة والفخامة المعمارية',
      title_en: 'Harmony of Nature & Grand Architecture',
      desc_ar: 'نبتكر مجتمعات سكنية متكاملة تمنحك إحساساً حقيقياً بالانتماء، محاطة بمساحات خضراء مفتوحة وتشطيبات استثنائية تلهم الحواس وتضمن الخصوصية الكاملة.',
      desc_en: 'Thoughtfully master-planned residential enclaves delivering true belonging, lush private landscaping, and refined architectural aesthetics.',
      tag_ar: 'بيئة سكنية ملهمة',
      tag_en: 'INSPIRING ENVIRONMENT',
    },
    {
      number: '02',
      title_ar: 'قيمة استثمارية تتوارثها الأجيال',
      title_en: 'Enduring Generational Value',
      desc_ar: 'نختار مواقع مشاريعنا بدقة استراتيجية فائقة في أكثر المناطق حيوية ونمواً، لضمان تصاعد القيمة الرأسمالية وتحقيق أعلى العوائد الاستثمارية المستدامة.',
      desc_en: 'Strategically located in premier high-growth destinations to secure strong capital appreciation and sustainable long-term rental yields.',
      tag_ar: 'نمو رأسمالي متصاعد',
      tag_en: 'CAPITAL APPRECIATION',
    },
    {
      number: '03',
      title_ar: 'مرافق حصرية ونمط معيشي فندقي',
      title_en: 'Bespoke Amenities & Private Privileges',
      desc_ar: 'من المسابح البانورامية والنوادي الصحية الخاصة، إلى خدمات الكونسيرج الذكية وإدارة المرافق المتواصلة 24/7 لراحة بال دائمة.',
      desc_en: 'From infinity rooftop pools and private wellness spas to 24/7 smart concierge and asset management for absolute peace of mind.',
      tag_ar: 'خدمات فندقية 24/7',
      tag_en: '5-STAR LIVING',
    },
  ];

  // GSAP Animations: Flip Cinema Video Expansion & initLivingAnimations Text Stagger
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoWrapperRef.current;
    if (!section || !video) return;

    const ctx = gsap.context(() => {
      // 1. One Green Way Flip Expansion on Scroll Effect (.living-video_wrapper)
      gsap.fromTo(
        video,
        {
          scale: 0.92,
          borderRadius: '2rem',
          y: 40,
        },
        {
          scale: 1,
          borderRadius: '1rem',
          y: 0,
          scrollTrigger: {
            trigger: video,
            start: 'top bottom-=50',
            end: 'top 35%',
            scrub: 1,
          },
          ease: 'power1.inOut',
        }
      );

      // 2. One Green Way initLivingAnimations on .living_component and [living-description] .line
      const livingComponents = section.querySelectorAll('.living_component');
      livingComponents.forEach((comp) => {
        const words = comp.querySelectorAll('[living-description] .line');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: comp,
            start: 'top 95%',
            end: 'top 45%',
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        // Animate the entire living_component
        tl.fromTo(
          comp,
          { y: '10%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 1, ease: 'power1.inOut' }
        );

        // Animate words inside [living-description] with stagger
        if (words.length) {
          tl.fromTo(
            words,
            { y: '-100%', opacity: 0 },
            { y: '0%', opacity: 1, duration: 0.7, stagger: 0.1 },
            '<'
          );
        }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const toggleMute = () => {
    if (videoElementRef.current) {
      videoElementRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (videoElementRef.current) {
      if (isPlaying) {
        videoElementRef.current.pause();
      } else {
        void videoElementRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const videoUrl = "https://cdn.pixabay.com/video/2021/08/11/84687-587216124_large.mp4";
  const posterUrl = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=90";

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-ivory dark:bg-forest text-forest dark:text-ivory relative overflow-hidden border-t border-beige/70 dark:border-white/10"
    >
      {/* Subtle architectural ambient lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#C6A45B_1px,transparent_1px)] [background-size:36px_36px] opacity-5 pointer-events-none" />

      <div className="container-custom relative z-10">
        
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-white/90 dark:bg-emerald/60 border border-gold/40 text-emerald dark:text-gold text-xs font-semibold uppercase tracking-widest mb-4 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            {lang === 'ar' ? 'فلسفة الهشام المعمارية' : 'THE LIVING PHILOSOPHY'}
          </div>
          <EditorialText
            as="h2"
            animation="word-title"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-bold leading-[1.15] text-forest dark:text-white"
          >
            {lang === 'ar'
              ? 'أسلوب حياة متكامل يجسد أسمى معاني الرفاهية'
              : 'An Exceptional Way of Life Where Legacy Meets Nature'}
          </EditorialText>
          <EditorialText
            as="p"
            animation="letter-opacity"
            className="text-textSecondary text-sm sm:text-base mt-4 leading-relaxed font-light max-w-2xl font-sans"
          >
            {lang === 'ar'
              ? 'نؤمن في الهشام أن العقار الفاخر ليس مجرد جدران، بل تجربة متكاملة ترتقي بجودة حياتك وتمنح عائلتك إرثاً حقيقياً يدوم.'
              : 'At Al Hisham, we believe luxury real estate is not merely structures, but an elevated living experience shaping enduring generational heritage.'}
          </EditorialText>
        </div>

        {/* Signature One Green Way Living Cinema Canvas (.living-video_wrapper) */}
        <div className="mb-20 sm:mb-24">
          <div
            ref={videoWrapperRef}
            className="living-video_wrapper relative overflow-hidden h-[340px] sm:h-[460px] lg:h-[580px] shadow-2xl border border-white/15 group will-change-transform"
          >
            <video
              ref={videoElementRef}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
              poster={posterUrl}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>

            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/85 via-forest-dark/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-forest-dark/70 via-transparent to-forest-dark/40" />

            {/* Top Bar Telemetry */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-xs text-white z-10">
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-forest-dark/80 backdrop-blur-md border border-gold/30 text-gold text-[11px] font-semibold tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                <span>{lang === 'ar' ? 'جولة معمارية سنمائية 4K' : '4K CINEMATIC TOUR'}</span>
              </div>

              {/* Sound & Fullscreen Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
                  className="w-10 h-10 rounded-full bg-forest-dark/80 backdrop-blur-md border border-white/20 text-white hover:text-gold hover:border-gold transition-colors flex items-center justify-center shadow-lg"
                >
                  {isMuted ? <FiVolumeX className="w-4 h-4" /> : <FiVolume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() =>
                    openVideo({
                      src: videoUrl,
                      title:
                        lang === 'ar'
                          ? 'فلسفة الهشام المعمارية — آفاق السكن الراقي'
                          : 'Al Hisham Architectural Living Experience',
                      poster: posterUrl,
                    })
                  }
                  title="Fullscreen"
                  className="w-10 h-10 rounded-full bg-forest-dark/80 backdrop-blur-md border border-white/20 text-white hover:text-gold hover:border-gold transition-colors flex items-center justify-center shadow-lg cursor-pointer"
                >
                  <FiMaximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Caption & Play Overlay */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-10">
              <div className="max-w-xl">
                <span className="text-gold text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase block mb-1">
                  {lang === 'ar' ? 'الهشام — آفاق السكن الراقي' : 'AL HISHAM LIVING EXPERIENCE'}
                </span>
                <p className="text-white text-base sm:text-xl font-bold font-sans">
                  {lang === 'ar'
                    ? 'رؤية معمارية تحاكي كبرى المنتجعات العالمية في قلب مشاريعنا'
                    : 'Architectural distinction capturing the spirit of world-class resort living'}
                </p>
              </div>

              <button
                onClick={togglePlay}
                className="self-start sm:self-auto inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gold text-forest font-bold text-xs uppercase tracking-wider shadow-xl hover:bg-gold-light transition-all"
              >
                <FiPlay className="w-3.5 h-3.5 fill-current" />
                <span>{isPlaying ? (lang === 'ar' ? 'إيقاف مؤقت' : 'Pause Tour') : (lang === 'ar' ? 'تشغيل الجولة' : 'Play Tour')}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Editorial Pillars Grid - One Green Way .living_component Spec */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {lifestylePillars.map((pillar, idx) => (
            <div
              key={idx}
              className="living_component p-8 sm:p-10 rounded-2xl bg-white dark:bg-emerald/30 border border-beige/80 dark:border-white/10 hover:border-gold/50 transition-all duration-500 flex flex-col justify-between group hover:-translate-y-1.5 shadow-sm hover:shadow-xl will-change-transform"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-3xl font-editorial italic text-gold font-bold">
                    {pillar.number}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-ivory dark:bg-white/5 border border-beige/70 dark:border-white/10 text-[10px] font-semibold tracking-wider text-textSecondary dark:text-ivory/80 uppercase">
                    {lang === 'ar' ? pillar.tag_ar : pillar.tag_en}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold font-sans text-forest dark:text-white mb-4 group-hover:text-emerald dark:group-hover:text-gold transition-colors leading-snug">
                  {lang === 'ar' ? pillar.title_ar : pillar.title_en}
                </h3>

                {/* Staggered Line Animation Container (One Green Way [living-description] .line) */}
                <p living-description="" className="text-textSecondary text-xs sm:text-sm leading-relaxed font-light font-sans">
                  {(lang === 'ar' ? pillar.desc_ar : pillar.desc_en).split(/([،,.]\s*)/).filter(Boolean).map((segment, sIdx) => (
                    <span key={sIdx} className="overflow-hidden inline-block align-bottom">
                      <span className="line inline-block will-change-transform">
                        {segment}
                      </span>
                    </span>
                  ))}
                </p>
              </div>

              <div className="pt-8 mt-8 border-t border-beige/60 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald dark:text-gold tracking-widest uppercase">
                  {lang === 'ar' ? 'معايير الهشام' : 'AL HISHAM STANDARD'}
                </span>
                <span className="text-gold text-sm group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">❖</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
