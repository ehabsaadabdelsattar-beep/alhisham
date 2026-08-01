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

function StatItem({ end, suffix = '', prefix = '', label, duration = 2000, shouldStart, index }: CounterProps & { label: string; shouldStart: boolean; index: number }) {
  const count = useCountUp(end, duration, shouldStart);
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-6 sm:p-8 relative group"
      initial={{ opacity: 0, y: 20 }}
      animate={shouldStart ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div dir="ltr" className="flex items-baseline justify-center text-3xl sm:text-4xl md:text-5xl font-bold text-white font-english tabular-nums tracking-tight mb-2 whitespace-nowrap">
        {prefix && <span className="text-gradient-gold mr-1">{prefix}</span>}
        <span className="text-gradient-gold">{count.toLocaleString()}</span>
        {suffix && <span className="text-lg sm:text-xl md:text-2xl text-white ml-2 font-arabic">{suffix}</span>}
      </div>
      <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-medium text-center mt-2">{label}</p>
    </motion.div>
  );
}

export default function StatsSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const stats = [
    { end: 15, prefix: '+', label: t('stats.years') },
    { end: 87, prefix: '+', label: t('stats.projects') },
    { end: 1240, prefix: '+', label: t('stats.clients') },
    { end: 850000, prefix: '+', suffix: 'م²', label: t('stats.sqm') },
  ];

  return (
    <section ref={ref} className="bg-black py-12 border-y border-gold/20 relative z-20 overflow-hidden">
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-white/10">
          {stats.map((stat, i) => (
            <StatItem key={i} {...stat} shouldStart={isInView} duration={1800 + i * 200} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
