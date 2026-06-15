import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';

export default function TimelineSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [
    {
      title: 'دراسة المشروع',
      titleEn: 'Project Study',
      desc: 'تحليل دقيق للسوق والموقع واحتياجات العملاء لضمان نجاح المشروع استثمارياً وسكنياً.',
      descEn: 'Thorough analysis of the market, location, and client needs to ensure investment and residential success.',
      icon: '01',
    },
    {
      title: 'التخطيط والتصميم',
      titleEn: 'Planning & Design',
      desc: 'إعداد تصاميم معمارية عصرية تلبي طموحات عملائنا وتراعي أدق التفاصيل الجمالية والعملية.',
      descEn: 'Creating modern architectural designs that meet our clients\' ambitions, focusing on aesthetic and practical details.',
      icon: '02',
    },
    {
      title: 'التنفيذ والبناء',
      titleEn: 'Execution & Construction',
      desc: 'استخدام أحدث تقنيات البناء وأجود المواد تحت إشراف هندسي صارم لضمان الجودة والمتانة.',
      descEn: 'Using the latest construction technologies and finest materials under strict engineering supervision for quality and durability.',
      icon: '03',
    },
    {
      title: 'التسليم وما بعد البيع',
      titleEn: 'Delivery & After-Sales',
      desc: 'تسليم المشاريع في المواعيد المحددة مع تقديم خدمات متكاملة لإدارة الأملاك وصيانتها.',
      descEn: 'Delivering projects on schedule while providing comprehensive property management and maintenance services.',
      icon: '04',
    },
  ];

  return (
    <section ref={ref} className="section-padding bg-dark text-white relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold via-dark to-dark" />

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold text-xs font-semibold tracking-widest uppercase mb-4 rounded-full border border-gold/20">
            {t('nav.home') === 'الرئيسية' ? 'رحلة المشروع' : 'Project Journey'}
          </div>
          <h2 className="section-title text-white">
            {t('nav.home') === 'الرئيسية' ? 'خطوات متقنة نحو التميز' : 'Meticulous Steps Towards Excellence'}
          </h2>
          <div className="gold-divider mx-auto my-6" />
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Main Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2" />
          <motion.div
            className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent -translate-y-1/2 origin-left"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />

          <div className="grid lg:grid-cols-4 gap-12 lg:gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + idx * 0.2 }}
                className="relative group text-center lg:text-start"
              >
                {/* Number Circle */}
                <div className="relative z-10 w-16 h-16 mx-auto lg:mx-0 mb-8 bg-dark border-2 border-white/20 rounded-full flex items-center justify-center text-xl font-bold font-english text-white/50 group-hover:border-gold group-hover:text-gold group-hover:bg-gold/10 transition-all duration-500 shadow-xl">
                  {step.icon}
                  {/* Pulse Effect */}
                  <div className="absolute inset-0 rounded-full border border-gold/0 group-hover:border-gold/50 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-gold transition-colors">
                  {t('nav.home') === 'الرئيسية' ? step.title : step.titleEn}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {t('nav.home') === 'الرئيسية' ? step.desc : step.descEn}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
