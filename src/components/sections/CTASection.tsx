import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLang } from '../../context/LanguageContext';
import LuxuryButton from '../ui/LuxuryButton';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CTASection() {
  const { t } = useTranslation();
  const { lang } = useLang();

  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);

  const trustBadges = [
    lang === 'ar' ? 'مشاريع مرخصة ومعتمدة رسمياً' : 'Verified Licensed Projects',
    lang === 'ar' ? 'أنظمة سداد استثمارية مرنة' : 'Flexible Payment Plans',
    lang === 'ar' ? 'استشارات معمارية وهندسية متخصصة' : 'Engineering & Advisory Services',
    lang === 'ar' ? 'ضمان الجودة ودقة التنفيذ' : 'Guaranteed Quality Assurance',
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // 1. Background image parallax scrub
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // 2. Main content reveal
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      // 3. Staggered trust badges reveal
      if (badgesRef.current) {
        const badges = badgesRef.current.children;
        gsap.fromTo(
          badges,
          { opacity: 0, y: 25, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: badgesRef.current,
              start: 'top 90%',
              once: true,
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 overflow-hidden bg-ivory text-forest border-t border-beige/70">
      {/* Background Architectural Image (GSAP Parallax) */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center opacity-[0.06] mix-blend-luminosity will-change-transform"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ivory via-ivory/90 to-ivory/80 z-0 pointer-events-none" />

      <div className="container-custom relative z-10 text-center">
        <div ref={contentRef} className="max-w-3xl mx-auto space-y-6">
          <div className="section-subtitle justify-center">
            <span className="w-6 h-px bg-emerald dark:bg-gold" />
            <span className="text-emerald dark:text-gold">{lang === 'ar' ? 'تواصل مع خبراء الهشام' : 'CONNECT WITH AL HISHAM ADVISORS'}</span>
            <span className="w-6 h-px bg-emerald dark:bg-gold" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-sans text-forest leading-tight">
            {lang === 'ar' ? (
              <>
                جاهز لاتخاذ خطوتك العقارية القادمة؟
                <br />
                <span className="font-readex font-normal text-emerald block sm:inline">
                  احجز استشارتك الاستثمارية الآن
                </span>
              </>
            ) : (
              <>
                Ready to Take Your Next
                <br />
                <span className="font-editorial italic font-normal text-emerald block sm:inline">
                  Luxury Real Estate Milestone?
                </span>
              </>
            )}
          </h2>
          <div className="gold-divider mx-auto" />
          
          <p className="text-textSecondary text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto font-sans">
            {lang === 'ar'
              ? 'تواصل مع فريقنا المعماري والاستثماري اليوم للحصول على استشارة متخصصة مصممة خصيصاً لتناسب أهدافك العقارية.'
              : 'Speak directly with our real estate development advisory team for personalized guidance on premier assets.'}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
            <LuxuryButton
              to="/contact"
              variant="emerald"
              text={t('cta.cta_consult')}
              className="!px-8 !py-4 !rounded-xl text-xs font-bold text-white shadow-xl hover:scale-[1.02] transition-transform"
            />
            <LuxuryButton
              to="/projects"
              variant="outline-emerald"
              text={lang === 'ar' ? 'استكشف محفظة المشاريع' : 'Explore Portfolio'}
              className="!px-8 !py-4 !rounded-xl text-xs font-bold hover:scale-[1.02] transition-transform"
            />
          </div>

          {/* Trust Badges - 14px rounded pills (GSAP Animated) */}
          <div ref={badgesRef} className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
            {trustBadges.map((badge, idx) => (
              <div
                key={idx}
                className="px-4 py-2.5 rounded-xl bg-white border border-beige/80 text-textPrimary text-xs font-medium shadow-sm font-sans"
              >
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
