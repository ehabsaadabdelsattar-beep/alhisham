import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';

interface CounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

function useCountUp(end: number, duration = 2000, shouldStart: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shouldStart) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, shouldStart]);
  return count;
}

function StatCard({ end, suffix = '', prefix = '', label, icon, duration = 2000, shouldStart, index }: CounterProps & { label: string; icon: React.ReactNode; shouldStart: boolean; index: number }) {
  const count = useCountUp(end, duration, shouldStart);
  return (
    <motion.div
      className="text-center group relative"
      initial={{ opacity: 0, y: 40 }}
      animate={shouldStart ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gold/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -m-4" />
      
      <div className="relative">
        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-5 mx-auto">
          <div className="absolute inset-0 bg-gold/10 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gold/5 rounded-2xl -rotate-3 group-hover:-rotate-6 transition-transform duration-500" />
          <div className="relative text-gold w-8 h-8">{icon}</div>
        </div>
        <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-english tabular-nums">
          {prefix}{count.toLocaleString()}{suffix}
        </div>
        <motion.div
          className="w-10 h-0.5 bg-gold mx-auto mb-3"
          initial={{ scaleX: 0 }}
          animate={shouldStart ? { scaleX: 1 } : {}}
          transition={{ duration: 0.5, delay: index * 0.15 + 0.4 }}
        />
        <p className="text-gray-400 text-sm tracking-wide">{label}</p>
      </div>
    </motion.div>
  );
}

export default function StatsSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const stats = [
    {
      end: 15,
      suffix: '+',
      label: t('stats.years'),
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      end: 120,
      suffix: '+',
      label: t('stats.projects'),
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      end: 500,
      suffix: '+',
      label: t('stats.clients'),
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      end: 2000000,
      suffix: '+',
      label: t('stats.sqm'),
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
  ];

  return (
    <section ref={ref} className="bg-dark py-20 md:py-28 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #C9A84C 1px, transparent 0)', backgroundSize: '40px 40px' }}
      />
      {/* Gold accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="container-custom relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p className="section-subtitle">{t('stats.title')}</p>
          <div className="w-12 h-0.5 bg-gold mx-auto" />
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} shouldStart={isInView} duration={2000 + i * 200} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
