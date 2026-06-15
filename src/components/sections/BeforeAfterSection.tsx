import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const beforeImg = 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80';
const afterImg = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80';

export default function BeforeAfterSection() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(5, Math.min(95, pos)));
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (dragging) updateSlider(e.clientX);
  }, [dragging, updateSlider]);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', () => setDragging(false));
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [dragging, onMouseMove]);

  return (
    <section className="section-padding bg-dark overflow-hidden">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <p className="section-subtitle">{t('beforeafter.subtitle')}</p>
            <h2 className="section-title text-white mb-4">{t('beforeafter.title')}</h2>
            <div className="gold-divider" />
            <p className="text-gray-400 leading-relaxed text-lg mb-8">{t('beforeafter.description')}</p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-4 h-4 bg-dark-300 border border-white/20 rounded-sm" />
                {t('beforeafter.before')}
              </div>
              <div className="flex items-center gap-2 text-gold">
                <div className="w-4 h-4 bg-gold/20 border border-gold/40 rounded-sm" />
                {t('beforeafter.after')}
              </div>
            </div>
          </div>

          {/* Slider */}
          <div
            ref={containerRef}
            className="before-after-container relative h-80 md:h-[450px] select-none rounded-none overflow-hidden shadow-luxury-dark cursor-col-resize"
            onMouseDown={(e) => { setDragging(true); updateSlider(e.clientX); }}
            onTouchMove={(e) => updateSlider(e.touches[0].clientX)}
          >
            {/* Before Image (full width) */}
            <img src={beforeImg} alt="Before" className="absolute inset-0 w-full h-full object-cover" draggable={false} />

            {/* After Image (clipped) */}
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
              <img src={afterImg} alt="After" className="absolute inset-0 w-full h-full object-cover" style={{ width: `${(100 / sliderPos) * 100}%`, minWidth: '100%' }} draggable={false} />
            </div>

            {/* Labels */}
            <div className="absolute top-4 right-4 bg-dark/70 text-white text-xs font-semibold px-3 py-1.5 backdrop-blur-sm tracking-widest">
              {t('beforeafter.before')}
            </div>
            <div className="absolute top-4 left-4 bg-gold text-dark text-xs font-semibold px-3 py-1.5 tracking-widest">
              {t('beforeafter.after')}
            </div>

            {/* Slider Line */}
            <div
              className="before-after-slider"
              style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
            >
              {/* Handle */}
              <div className="before-after-handle">
                <svg className="w-5 h-5 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
