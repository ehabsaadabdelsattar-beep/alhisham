import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import LuxuryButton from '../ui/LuxuryButton';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function InvestmentSection() {
  const { lang } = useLang();
  const { profile } = useAuth();
  const isInvestor = profile?.role === 'investor';

  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // 1. Background image subtle parallax
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          yPercent: 15,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // 2. Left column reveal
      if (leftColRef.current) {
        gsap.fromTo(
          leftColRef.current,
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

      // 3. Right column card reveal
      if (rightColRef.current) {
        gsap.fromTo(
          rightColRef.current,
          { opacity: 0, y: 50, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            delay: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-ivory dark:bg-forest text-forest dark:text-white relative overflow-hidden border-t border-beige/70 dark:border-white/10">
      {/* Background Architectural Overlay (GSAP Parallax) */}
      <div
        ref={bgRef}
        className="absolute inset-0 opacity-[0.07] bg-cover bg-center mix-blend-luminosity will-change-transform"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ivory/90 via-ivory/80 to-transparent z-0 pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Content (7 Cols) */}
          <div ref={leftColRef} className="lg:col-span-7 space-y-6">
            <div className="section-subtitle">
              <span className="w-6 h-px bg-emerald dark:bg-gold" />
              <span className="text-emerald dark:text-gold">{lang === 'ar' ? 'الفرص الاستثمارية' : 'Investment Opportunities'}</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-sans leading-tight text-forest dark:text-white">
              {lang === 'ar' ? (
                <>
                  استثمر بثقة في مستقبل{' '}
                  <span className="font-readex font-normal text-emerald dark:text-gold block sm:inline">
                    التطوير العقاري الفاخر
                  </span>
                </>
              ) : (
                <>
                  Invest with Confidence in{' '}
                  <span className="font-editorial italic font-normal text-emerald dark:text-gold block sm:inline">
                    Luxury Real Estate
                  </span>
                </>
              )}
            </h2>
            <div className="gold-divider" />
            
            <p className="text-textSecondary text-sm sm:text-base leading-relaxed font-light max-w-xl font-sans">
              {lang === 'ar'
                ? 'نوفر خيارات استثمارية فاخرة ومستدامة تم دراستها بعناية فائقة لتحقيق أعلى العوائد المالية وحماية قيمة الأصول وتنميتها على المدى الطويل.'
                : 'Delivering luxury real estate investment solutions engineered for capital growth, risk optimization, and high yield portfolio performance.'}
            </p>

            <div className="grid sm:grid-cols-3 gap-6 pt-4 border-t border-beige/60 dark:border-white/10">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-emerald dark:text-gold font-sans font-english">18-24%</p>
                <p className="text-xs text-textSecondary mt-1 uppercase tracking-wider font-sans">
                  {lang === 'ar' ? 'متوسط العائد المستهدف' : 'Target Annual ROI'}
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-emerald dark:text-gold font-sans font-english">100%</p>
                <p className="text-xs text-textSecondary mt-1 uppercase tracking-wider font-sans">
                  {lang === 'ar' ? 'أصول مدعومة بضمانات' : 'Prime Asset Backed'}
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-emerald dark:text-gold font-sans font-english">+15 عاماً</p>
                <p className="text-xs text-textSecondary mt-1 uppercase tracking-wider font-sans">
                  {lang === 'ar' ? 'خبرة وتاريخ عريق' : 'Market Expertise'}
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-4">
              {isInvestor ? (
                <LuxuryButton
                  to="/investor"
                  variant="emerald"
                  text={lang === 'ar' ? 'لوحة تحكم المستثمر' : 'Investor Dashboard'}
                  className="!px-8 !py-4 !rounded-xl text-xs font-bold"
                />
              ) : (
                <LuxuryButton
                  to="/contact"
                  variant="gold"
                  text={lang === 'ar' ? 'طلب استشارة استثمارية' : 'Request Investment Advisory'}
                  className="!px-8 !py-4 !rounded-xl text-xs font-bold text-forest shadow-lg"
                />
              )}
              <LuxuryButton
                to="/projects"
                variant="outline-emerald"
                text={lang === 'ar' ? 'تصفح محفظة المشاريع' : 'View Portfolio'}
                className="!px-8 !py-4 !rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          {/* Investment Highlight Card (5 Cols) - 16px Rounded (GSAP Animated) */}
          <div ref={rightColRef} className="lg:col-span-5">
            <div className="p-8 sm:p-9 rounded-2xl bg-white dark:bg-emerald-dark/60 border border-beige/80 dark:border-white/15 shadow-sm hover:shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-px bg-gold" />
                <h3 className="text-emerald dark:text-gold font-bold text-xs uppercase tracking-widest font-sans">
                  {lang === 'ar' ? 'برنامج الهشام للاستثمار' : 'Al Hisham Program'}
                </h3>
              </div>
              <h4 className="text-2xl font-bold text-forest dark:text-white font-sans">
                {lang === 'ar' ? 'حلول استثمارية مخصصة لتحقيق طموحاتك' : 'Flexible Investment Tailored for Growth'}
              </h4>
              <p className="text-textSecondary text-xs sm:text-sm leading-relaxed font-light font-sans">
                {lang === 'ar'
                  ? 'يتيح لك برنامجنا الاستثماري المشاركة المباشرة في المشاريع العقارية الكبرى مع الحصول على تقارير دورية وشفافية كاملة في كل خطوة.'
                  : 'Direct participation in premier commercial and residential assets backed by comprehensive performance reporting.'}
              </p>

              <div className="space-y-3.5 pt-2">
                {[
                  lang === 'ar' ? 'تقارير أداء ومحفظة دورية ومحدثة' : 'Regular Investor Performance Reporting',
                  lang === 'ar' ? 'إدارة متكاملة وحكيمة للمخاطر والأصول' : 'Integrated Asset Risk Management',
                  lang === 'ar' ? 'عقود استثمارية معتمدة وموثقة رسمياً' : 'Verified Legal & Equity Contracts',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-textPrimary dark:text-ivory/90 font-sans">
                    <span className="w-5 h-5 rounded-full bg-gold/20 text-gold flex items-center justify-center text-[10px] flex-shrink-0">
                      ✓
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
