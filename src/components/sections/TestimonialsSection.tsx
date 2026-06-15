import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLang } from '../../context/LanguageContext';
import { testimonials } from '../../data';

export default function TestimonialsSection() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const [active, setActive] = useState(0);

  const prev = () => setActive(i => (i - 1 + testimonials.length) % testimonials.length);
  const next = () => setActive(i => (i + 1) % testimonials.length);

  const current = testimonials[active];

  return (
    <section className="section-padding bg-primary relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold/10 rounded-full translate-x-1/2 translate-y-1/2" />
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }}
      />

      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <p className="text-gold font-medium tracking-[0.3em] uppercase text-sm mb-2">{t('testimonials.subtitle')}</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">{t('testimonials.title')}</h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main testimonial */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-10 md:p-14 text-center relative">
            {/* Quote icon */}
            <div className="absolute top-8 left-8 text-gold/30 text-8xl font-serif leading-none select-none">"</div>
            <div className="absolute bottom-8 right-8 text-gold/30 text-8xl font-serif leading-none select-none rotate-180">"</div>

            <div className="relative z-10">
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: current.rating }).map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-10 italic">
                "{lang === 'ar' ? current.textAr : current.textEn}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-center gap-4">
                <img
                  src={current.image}
                  alt={lang === 'ar' ? current.nameAr : current.nameEn}
                  className="w-14 h-14 rounded-full object-cover border-2 border-gold"
                />
                <div className="text-start rtl:text-end">
                  <p className="text-white font-bold">{lang === 'ar' ? current.nameAr : current.nameEn}</p>
                  <p className="text-gold text-sm">{lang === 'ar' ? current.roleAr : current.roleEn}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={prev} className="w-12 h-12 border border-white/30 text-white hover:bg-white hover:text-primary transition-all duration-200 flex items-center justify-center">
              <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`rounded-full transition-all duration-300 ${i === active ? 'w-8 h-2 bg-gold' : 'w-2 h-2 bg-white/40 hover:bg-white'}`}
                />
              ))}
            </div>
            <button onClick={next} className="w-12 h-12 border border-white/30 text-white hover:bg-white hover:text-primary transition-all duration-200 flex items-center justify-center">
              <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Thumbnail avatars */}
          <div className="flex justify-center gap-3 mt-6">
            {testimonials.map((t2, i) => (
              <button key={i} onClick={() => setActive(i)} className={`rounded-full overflow-hidden transition-all duration-300 ${i === active ? 'ring-2 ring-gold scale-110' : 'opacity-50 hover:opacity-100'}`}>
                <img src={t2.image} alt="" className="w-10 h-10 object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
