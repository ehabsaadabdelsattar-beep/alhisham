import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface StatConfig {
  end: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

export default function StatsSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);
  const numbersRef = useRef<HTMLSpanElement[]>([]);

  const stats: StatConfig[] = [
    { end: 15, prefix: '+', label: t('stats.years') },
    { end: 87, prefix: '+', label: t('stats.projects') },
    { end: 1240, prefix: '+', label: t('stats.clients') },
    { end: 850000, prefix: '+', suffix: 'م²', label: t('stats.sqm') },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // 1. Staggered card entrance with ScrollTrigger
      gsap.fromTo(
        itemsRef.current,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            once: true,
          },
        }
      );

      // 2. Smooth GSAP counter for each statistic
      stats.forEach((stat, idx) => {
        const numEl = numbersRef.current[idx];
        if (!numEl) return;

        const counterObj = { value: 0 };

        gsap.to(counterObj, {
          value: stat.end,
          duration: 2.2 + idx * 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            once: true,
          },
          onUpdate: () => {
            numEl.textContent = Math.floor(counterObj.value).toLocaleString();
          },
        });
      });
    }, section);

    return () => ctx.revert();
  }, [t]);

  return (
    <section
      ref={sectionRef}
      className="bg-ivory dark:bg-forest py-8 sm:py-12 border-b border-beige/70 dark:border-white/10 relative z-20 overflow-hidden"
    >
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-beige/80 dark:divide-white/10">
          {stats.map((stat, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) itemsRef.current[i] = el;
              }}
              className="flex flex-col items-center justify-center p-6 sm:p-8 relative group cursor-default"
            >
              <div
                dir="ltr"
                className="flex items-baseline justify-center text-3xl sm:text-4xl md:text-5xl font-bold text-emerald dark:text-ivory font-english tabular-nums tracking-tight mb-1 whitespace-nowrap"
              >
                {stat.prefix && <span className="text-gold mr-1.5 font-normal">{stat.prefix}</span>}
                <span
                  ref={(el) => {
                    if (el) numbersRef.current[i] = el;
                  }}
                  className="font-sans"
                >
                  0
                </span>
                {stat.suffix && (
                  <span className="text-lg sm:text-xl md:text-2xl text-textSecondary dark:text-beige ml-2 font-arabic">
                    {stat.suffix}
                  </span>
                )}
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-textSecondary dark:text-gray-400 font-medium text-center mt-2 font-sans">
                {stat.label}
              </p>
              {/* Subtle indicator dot with GSAP hover feel */}
              <span className="w-1.5 h-1.5 rounded-full bg-gold/50 mt-3 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
