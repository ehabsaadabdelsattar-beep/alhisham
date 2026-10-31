import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLang } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiCheckCircle } from 'react-icons/fi';
import LuxuryButton from '../ui/LuxuryButton';
import ParallaxImage from '../ui/ParallaxImage';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ResidenceType {
  id: string;
  tag_ar: string;
  tag_en: string;
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  desc_ar: string;
  desc_en: string;
  area_ar: string;
  area_en: string;
  beds_ar: string;
  beds_en: string;
  view_ar: string;
  view_en: string;
  delivery_ar: string;
  delivery_en: string;
  image: string;
  features_ar: string[];
  features_en: string[];
}

const residences: ResidenceType[] = [
  {
    id: 'horizon',
    tag_ar: 'قصور الأفق الفاخرة',
    tag_en: 'HORIZON MANSIONS',
    title_ar: 'فلل الأفق المعمارية المستقلة',
    title_en: 'Horizon Signature Mansions',
    subtitle_ar: 'قمة الخصوصية والفخامة بإطلالة بانورامية لا تنتهي',
    subtitle_en: 'The pinnacle of bespoke architectural privacy with infinite vistas',
    desc_ar: 'تصميم معماري فريد مستوحى من القصور الأوروبية الحديثة مع واجهات زجاجية ممتدة من الأرض إلى السقف، ومسبح خاص معلق على الروف وحدائق غناء تلتف حول القصر لضمان أعلى درجات الخصوصية.',
    desc_en: 'A bespoke architectural masterpiece inspired by modern European estates, featuring floor-to-ceiling glass facades, private rooftop infinity pool, and lush wrap-around gardens for complete tranquility.',
    area_ar: '680 - 950 م²',
    area_en: '680 - 950 SQM',
    beds_ar: '5 - 6 أجنحة فندقية',
    beds_en: '5 - 6 Master Suites',
    view_ar: 'إطلالة خضراء بانورامية 360°',
    view_en: '360° Panoramic Greenery',
    delivery_ar: 'الربع الرابع 2026',
    delivery_en: 'Q4 2026',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=85',
    features_ar: [
      'مسبح لا متناهي خاص على الروف وتراس شمسي',
      'مصعد داخلي زجاجي بانورامي يخدم كافة الطوابق',
      'تشطيبات رخامية إيطالية نادرة (Calacatta Gold)',
      'جراج تحت الأرض خاص يستوعب 4 سيارات',
      'نظام ذكي متكامل للمنزل والتحكم الصوتي 24/7',
    ],
    features_en: [
      'Private rooftop infinity pool & solarium terrace',
      'Bespoke private glass panoramic elevator',
      'Rare Italian marble finishes (Calacatta Gold)',
      'Private underground garage for up to 4 vehicles',
      'Full smart home automation & 24/7 security concierge',
    ],
  },
  {
    id: 'panorama',
    tag_ar: 'أجنحة البنتهاوس الملكية',
    tag_en: 'PANORAMA PENTHOUSES',
    title_ar: 'بنتهاوس البانوراما الملكي المزدوج',
    title_en: 'Panorama Royal Duplex Penthouses',
    subtitle_ar: 'عيش في أعالي السحاب مع أسقف مزدوجة الارتفاع',
    subtitle_en: 'Elevated sky-living with double-height volume and glass pavilions',
    desc_ar: 'أجنحة بنتهاوس رحبة تتميز بأسقف مزدوجة الارتفاع (Double-height) تصل إلى 6.5 متر، وتراسات واسعة مجهزة بجاكوزي خاص ومنطقة شواء خارجية للاستمتاع بأرقى التجمعات العائلية.',
    desc_en: 'Expansive penthouse residences crowned with dramatic 6.5m double-height ceilings, private terrace Jacuzzis, and bespoke outdoor entertaining pavilions for an incomparable lifestyle.',
    area_ar: '420 - 580 م²',
    area_en: '420 - 580 SQM',
    beds_ar: '4 أجنحة نوم فارهة',
    beds_en: '4 Ultra-luxury Suites',
    view_ar: 'إطلالة أفق المدينة المفتوحة',
    view_en: 'Unobstructed Skyline Panorama',
    delivery_ar: 'الربع الثاني 2026',
    delivery_en: 'Q2 2026',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600&q=85',
    features_ar: [
      'سقف صالون رئيسي مزدوج بارتفاع 6.5 متر',
      'جاكوزي خاص في التراس المفتوح ومطبخ خارجي',
      'غرفة معيشة عائلية مستقلة وجناح للخدمات',
      'نوافذ عازلة للصوت والحرارة بأعلى المواصفات',
      'مواقف سيارات خاصة مع شواحن سيارات كهربائية (EV)',
    ],
    features_en: [
      '6.5m soaring double-height grand salon ceiling',
      'Private terrace Jacuzzi & bespoke outdoor barbecue kitchen',
      'Separate private family lounge and staff quarters',
      'Triple-glazed acoustic & thermal panoramic fenestration',
      'Reserved private parking bays with EV superchargers',
    ],
  },
  {
    id: 'oasis',
    tag_ar: 'فيلات الواحة الخضراء',
    tag_en: 'OASIS GARDEN VILLAS',
    title_ar: 'تاون هاوس وفيلات الواحة بحديقة خاصة',
    title_en: 'Oasis Garden Townhomes & Villas',
    subtitle_ar: 'تناغم مثالي بين الطبيعة الغناء والخصوصية العائلية',
    subtitle_en: 'Harmonious family living woven into lush botanical landscape sanctuaries',
    desc_ar: 'وحدات تاون هاوس وفيلات شبه مستقلة تتميز بحدائق خلفية خاصة واسعة ومساحات استقبال خارجية مظللة، مع وصول مباشر إلى ممرات المشي الخضراء والبحيرات المائية.',
    desc_en: 'Semi-detached villas and townhomes opening onto secluded private gardens and covered outdoor dining pergolas, offering direct access to the botanical promenade and reflection streams.',
    area_ar: '310 - 450 م²',
    area_en: '310 - 450 SQM',
    beds_ar: '3 - 4 غرف نوم رئيسية',
    beds_en: '3 - 4 En-suite Bedrooms',
    view_ar: 'إطلالة الحدائق والمسطحات المائية',
    view_en: 'Lush Botanical Gardens & Waters',
    delivery_ar: 'الربع الثالث 2026',
    delivery_en: 'Q3 2026',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=85',
    features_ar: [
      'حديقة خاصة واسعة مع مسبح خاص اختياري',
      'تراس عائلي مظلل ومطبخ خارجي للشواء',
      'تصميم داخلي مفتوح يدمج الداخل بالطبيعة الخارجية',
      'غرفة سائق ومخزن واسع ملحق بالفيلا',
      'ألواح طاقة شمسية ومواد عزل حراري موفرة للطاقة',
    ],
    features_en: [
      'Expansive private garden with optional plunge pool',
      'Shaded family pergola & outdoor culinary barbecue station',
      'Seamless open-plan design connecting indoor/outdoor zones',
      'Private chauffeur quarters and large storage rooms',
      'Rooftop photovoltaic solar panels & thermal insulation',
    ],
  },
  {
    id: 'loft',
    tag_ar: 'شقق الدوبلكس واللوفت الفندقية',
    tag_en: 'EXECUTIVE URBAN LOFTS',
    title_ar: 'دوبلكس اللوفت العصري بأسلوب فندقي',
    title_en: 'Executive Urban Lofts & Duplexes',
    subtitle_ar: 'تصميم أوروبي معاصر لأصحاب الذوق الرفيع والمستثمرين',
    subtitle_en: 'Contemporary European loft architecture engineered for astute investors and urban connoisseurs',
    desc_ar: 'شقق دوبلكس ولوفت ذات طابع معماري فريد، مصممة بأعلى معايير التشطيب الفندقي الفاخر لتلائم المستثمرين والعائلات العصرية الباحثة عن موقع حيوي وخدمات متكاملة.',
    desc_en: 'Bespoke split-level duplex apartments finished to international boutique hotel standards, tailored for discerning professionals and high-yield real estate investment portfolios.',
    area_ar: '185 - 260 م²',
    area_en: '185 - 260 SQM',
    beds_ar: '2 - 3 أجنحة نوم',
    beds_en: '2 - 3 Bedroom Suites',
    view_ar: 'إطلالة المنتزه والبوليفارد التجاري',
    view_en: 'Linear Park & Promenade Boulevard',
    delivery_ar: 'الربع الأول 2027',
    delivery_en: 'Q1 2027',
    image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1600&q=85',
    features_ar: [
      'ارتفاع أسقف رحب وإضاءات معمارية مخفية',
      'مدخل خاص مستقل في الطابق الأرضي لبعض الوحدات',
      'مطبخ ألماني مجهز بالكامل بأحدث الأجهزة المدمجة',
      'أرضيات خشبية أوروبية طبيعية ومقاومة للماء',
      'عزل صوتي فندقي كامل لضمان الهدوء التام',
    ],
    features_en: [
      'Volumetric ceiling heights with recessed linear lighting',
      'Dedicated private street-level ground entrance',
      'Designer German kitchen fully fitted with integrated appliances',
      'Imported natural European oak hardwood flooring',
      '5-star hotel-grade acoustic attenuation for peace of mind',
    ],
  },
];

export default function ResidencesShowcase() {
  const { t } = useTranslation();
  const { lang, isRTL } = useLang();
  const [activeTab, setActiveTab] = useState<string>('horizon');

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const current = residences.find((r) => r.id === activeTab) || residences[0];

  // GSAP Header ScrollTrigger Entrance
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  // GSAP Tab Switch Transition
  useEffect(() => {
    if (!detailRef.current) return;

    gsap.fromTo(
      detailRef.current,
      { opacity: 0, y: 25, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        ease: 'power2.out',
        overwrite: 'auto',
      }
    );
  }, [activeTab]);

  return (
    <section ref={sectionRef} className="section-padding bg-ivory dark:bg-forest-dark text-forest dark:text-ivory relative overflow-hidden border-t border-beige/70 dark:border-white/10">
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#C6A45B_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.06] pointer-events-none" />

      {/* Ambient Emerald Glow Accent */}
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-gold/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -left-40 w-96 h-96 bg-emerald/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container-custom relative z-10">
        
        {/* Section Header (One Green Way Editorial Standard) */}
        <div ref={headerRef} className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 dark:bg-emerald-dark/90 border border-gold/40 text-emerald dark:text-gold text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase mb-4 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            {lang === 'ar' ? 'مجموعة الهشام السكنية الفاخرة' : 'THE SIGNATURE RESIDENCES'}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-sans text-forest dark:text-white leading-[1.14]">
            {lang === 'ar' ? (
              <>
                تصاميم معمارية خالدة تلامس{' '}
                <span className="font-readex font-normal text-gold block sm:inline">
                  قمة الكمال
                </span>
              </>
            ) : (
              <>
                Architectural Legacies Crafted{' '}
                <span className="font-editorial italic font-normal text-gold block sm:inline">
                  For Extraordinary Living
                </span>
              </>
            )}
          </h2>
          <p className="text-textSecondary text-sm sm:text-base mt-4 font-light leading-relaxed max-w-2xl font-sans">
            {lang === 'ar'
              ? 'استكشف تشكيلة وحداتنا الاستثنائية المصممة بعناية لتجمع بين المساحات الشاسعة، وأحدث تقنيات البناء المستدام، وأدق تفاصيل الفخامة العالمية.'
              : 'Explore our curated portfolio of residential masterworks, seamlessly blending generous spatial volumes, sustainable engineering, and uncompromising luxury.'}
          </p>
        </div>

        {/* Tab Navigation Selector */}
        <div className="flex flex-wrap gap-3 pb-8 mb-10 border-b border-beige/80 dark:border-white/10">
          {residences.map((res) => {
            const isActive = res.id === activeTab;
            return (
              <button
                key={res.id}
                onClick={() => setActiveTab(res.id)}
                className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold tracking-wider transition-all duration-300 flex items-center gap-3 cursor-pointer ${
                  isActive
                    ? 'bg-emerald text-white shadow-xl border border-emerald'
                    : 'bg-white/90 dark:bg-white/5 text-textSecondary dark:text-gray-300 hover:text-emerald dark:hover:text-white hover:bg-white border border-beige/80 dark:border-white/10'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-gold animate-pulse' : 'bg-gold/40'}`} />
                <span>{lang === 'ar' ? res.tag_ar : res.tag_en}</span>
              </button>
            );
          })}
        </div>

        {/* Active Residence Detail Showcase (GSAP Animated) */}
        <div
          ref={detailRef}
          className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center will-change-transform"
        >
          {/* Left Column: Image with Luxury Parallax & Specs Overlay (7 Cols) */}
          <div className="lg:col-span-7 relative group">
            <ParallaxImage
              src={current.image}
              alt={lang === 'ar' ? current.title_ar : current.title_en}
              className="rounded-2xl border border-white/10 shadow-2xl h-[420px] sm:h-[520px]"
              speed={10}
              overlay={<div className="absolute inset-0 bg-gradient-to-t from-forest-dark/90 via-forest/20 to-transparent pointer-events-none" />}
            >
              {/* Floating Architectural Badge */}
              <div className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-forest-dark/85 backdrop-blur-md border border-gold/30 text-gold text-xs font-semibold tracking-wider uppercase pointer-events-auto">
                {lang === 'ar' ? current.tag_ar : current.tag_en}
              </div>

              {/* Bottom Spec Quick Strip */}
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl bg-emerald-dark/90 backdrop-blur-xl border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center pointer-events-auto">
                <div>
                  <span className="text-[10px] text-gray-300 uppercase tracking-widest block">{lang === 'ar' ? 'المساحة' : 'AREA'}</span>
                  <span className="text-sm sm:text-base font-bold text-white font-sans mt-0.5 block">{lang === 'ar' ? current.area_ar : current.area_en}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-300 uppercase tracking-widest block">{lang === 'ar' ? 'الأجنحة' : 'BEDROOMS'}</span>
                  <span className="text-sm sm:text-base font-bold text-white font-sans mt-0.5 block">{lang === 'ar' ? current.beds_ar : current.beds_en}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-300 uppercase tracking-widest block">{lang === 'ar' ? 'الإطلالة' : 'VIEW'}</span>
                  <span className="text-sm sm:text-base font-bold text-white font-sans mt-0.5 block truncate">{lang === 'ar' ? current.view_ar : current.view_en}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-300 uppercase tracking-widest block">{lang === 'ar' ? 'التسليم' : 'HANDOVER'}</span>
                  <span className="text-sm sm:text-base font-bold text-gold font-sans mt-0.5 block">{lang === 'ar' ? current.delivery_ar : current.delivery_en}</span>
                </div>
              </div>
            </ParallaxImage>
          </div>

          {/* Right Column: Editorial Information & Bespoke Features (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-gold text-xs font-semibold tracking-widest uppercase block mb-2">
                {lang === 'ar' ? current.subtitle_ar : current.subtitle_en}
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-sans text-forest dark:text-white leading-snug">
                {lang === 'ar' ? current.title_ar : current.title_en}
              </h3>
              <div className="w-16 h-0.5 bg-gradient-to-r from-gold to-transparent my-4" />
            </div>

            <p className="text-textSecondary text-sm sm:text-base leading-relaxed font-light font-sans">
              {lang === 'ar' ? current.desc_ar : current.desc_en}
            </p>

            {/* Bespoke Features List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs uppercase tracking-widest text-emerald dark:text-gold font-bold font-sans">
                {lang === 'ar' ? 'أبرز المواصفات الحصرية:' : 'KEY SIGNATURE SPECIFICATIONS:'}
              </h4>
              <ul className="space-y-2.5">
                {(lang === 'ar' ? current.features_ar : current.features_en).map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-textPrimary dark:text-gray-200 font-sans">
                    <FiCheckCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap gap-4">
              <LuxuryButton
                to="/contact"
                variant="gold"
                text={lang === 'ar' ? 'طلب جولة خاصة VIP' : 'Request VIP Private Tour'}
                icon={<FiArrowUpRight className="w-4 h-4" />}
                className="!px-8 !py-3.5 !rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg"
              />
              <button
                type="button"
                data-download-masterplan=""
                data-project-name={lang === 'ar' ? current.title_ar : current.title_en}
                className="btn-outline-gold !text-forest dark:!text-white !border-emerald/30 dark:!border-white/20 hover:!border-gold hover:!text-gold !px-6 !py-3.5 !rounded-xl text-xs font-semibold tracking-wider cursor-pointer inline-flex items-center gap-2"
              >
                <span>{lang === 'ar' ? 'تحميل المخطط المعماري' : 'Download Masterplan Layout'}</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
