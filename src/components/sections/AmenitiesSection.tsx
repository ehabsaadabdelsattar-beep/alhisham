import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLang } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiArrowUpRight, FiCheck } from 'react-icons/fi';

// Ensure ScrollTrigger is registered
gsap.registerPlugin(ScrollTrigger);

interface AmenityItem {
  id: string;
  num: string;
  category_ar: string;
  category_en: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
  image: string;
  features_ar: string[];
  features_en: string[];
}

const amenitiesData: AmenityItem[] = [
  {
    id: 'clubhouse',
    num: '01',
    category_ar: 'الضيافة واللقاءات الحصرية',
    category_en: 'EXCLUSIVE HOSPITALITY',
    title_ar: 'النادي الخاص وصالة كبار الشخصيات',
    title_en: 'The Grand Clubhouse & Private Salon',
    desc_ar: 'صرح اجتماعي راقٍ صُمم ليكون ملتقى نخبة مجتمع الهشام، يضم صالات استقبال فندقية خاصة، ومطعم شيف خاص، وتراسات خارجية تطل على مساحات مائية خضراء بديعة.',
    desc_en: 'A sanctuary of refined social living crafted exclusively for residents, offering private reception salons, an executive dining room, and open verandas over manicured water gardens.',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=85',
    features_ar: ['صالة سيجار واستراحة VIP خاصة', 'مطعم شيف خاص وحفلات عشاء حصرية', 'تراس خارجي بإطلالة على البحيرة'],
    features_en: ['Private VIP lounge & cigar salon', 'Executive private chef dining experiences', 'Alfresco veranda overlooking reflection pools'],
  },
  {
    id: 'rooftop-pool',
    num: '02',
    category_ar: 'الاستجمام والإطلالات البانورامية',
    category_en: 'LEISURE & SKYLINE LIVING',
    title_ar: 'مسبح إنفينيتي بانورامي وتراس استجمام معلق',
    title_en: 'Rooftop Infinity Pool & Sky Solarium',
    desc_ar: 'مسبح لا متناهٍ يمتد على كامل الروف مع كابانات خاصة ومقاعد تشمس مغمورة بالمياه، يتيح لك الاستمتاع بلحظات الغروب الساحرة على أفق المدينة مع مشروبات منعشة.',
    desc_en: 'An expansive infinity pool commanding open skyline horizons, complemented by shaded private cabanas, submerged sun-loungers, and dusk cocktail service.',
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&q=85',
    features_ar: ['مسبح إنفينيتي بطول 35 متر مع تدفئة شتوية', 'كابانات استرخاء خاصة ومأكولات خفيفة', 'نظام تنقية مياه متطور بأملاح المغنيسيوم'],
    features_en: ['35m heated infinity pool for year-round swimming', 'Private serviced cabanas with refreshment service', 'Natural mineral & magnesium purified water system'],
  },
  {
    id: 'wellness-spa',
    num: '03',
    category_ar: 'الصحة والرفاهية المتكاملة',
    category_en: 'HOLISTIC WELLNESS',
    title_ar: 'سبا صحي متكامل ونادي للياقة البدنية',
    title_en: 'State-of-the-Art Spa & Thermal Suites',
    desc_ar: 'ملاذ متكامل للعناية بالجسم والروح يضم غرف ساونا فنلندية، وحمام بخار تركي، ومغطس ثلجي، وصالة جيم مجهزة بأحدث أجهزة تكنوجيم (Technogym) العالمية مع مدربين معتمدين.',
    desc_en: 'An oasis of rejuvenation featuring Finnish cedar saunas, traditional Turkish hammam, ice plunge pools, and a gymnasium equipped with Technogym smart consoles.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=85',
    features_ar: ['ساونا خشبية وبخار وغرف استرخاء ملحية', 'أجهزة Technogym الحديثة وجهاز محاكاة بيلاتيس', 'جلسات تدليك علاجية وعناية بالبشرة'],
    features_en: ['Aromatic saunas, steam rooms & Himalayan salt wall', 'Technogym biomechanical equipment & Pilates studio', 'Private treatment suites and hydrotherapy zones'],
  },
  {
    id: 'padel-sports',
    num: '04',
    category_ar: 'الرياضة والأنشطة النشطة',
    category_en: 'SPORTS & ENERGIZING LIFE',
    title_ar: 'ملاعب بادل وتنس ومسارات ركض طبيعية',
    title_en: 'Championship Padel Courts & Jogging Trails',
    desc_ar: 'ملاعب بادل وتنس زجاجية مطابقة للمواصفات الدولية مع إضاءة ليلية مريحة للعين، تحيط بها مسارات مشي وركض مشجرة بمطاط طبيعي ممتص للصدمات.',
    desc_en: 'Tournament-grade panoramic glass Padel and tennis courts with anti-glare LED illumination, enveloped by shock-absorbent shaded jogging trails.',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&q=85',
    features_ar: ['ملاعب بادل زجاجية مكيفة ومضاءة ليلاً', 'مسار ركض مشجر بطول 2.5 كم ممتص للصدمات', 'نادي رياضي صغير ومقهى للمشروبات الصحية'],
    features_en: ['Championship panoramic glass Padel court suites', '2.5km shaded shock-absorbent forest running circuit', 'Dedicated sports pro-shop & organic juice bar'],
  },
  {
    id: 'cinema-golf',
    num: '05',
    category_ar: 'الترفيه الرقمي الفاخر',
    category_en: 'DIGITAL ENTERTAINMENT',
    title_ar: 'سينما خاصة VIP ومحاكي جولف افتراضي',
    title_en: 'Private Cinema Screening & Golf Simulator',
    desc_ar: 'قاعة عرض سينمائي خاصة تتسع لـ 16 مقعداً من الجلد الفاخر بنظام صوت Dolby Atmos، إلى جانب أحدث محاكي جولف تفاعلي (TrackMan) للتدرب على أشهر ملاعب العالم.',
    desc_en: 'An intimate 16-seat Dolby Atmos private screening room with plush reclining leather seating, paired with a state-of-the-art TrackMan golf simulation studio.',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&q=85',
    features_ar: ['نظام صوتي سينمائي فائق Dolby Atmos 7.1.4', 'شاشة ليزرية عملاقة بدقة 4K HDR', 'محاكي ملاعب الجولف العالمية بدقة بالغة'],
    features_en: ['Acoustically tuned Dolby Atmos 7.1.4 spatial audio', 'Floor-to-ceiling 4K HDR high-contrast laser projection', 'TrackMan golf simulator mapping 100+ global courses'],
  },
  {
    id: 'concierge',
    num: '06',
    category_ar: 'الخدمات الفندقية والأمان',
    category_en: 'BESPOKE CONCIERGE',
    title_ar: 'خدمات كونسيرج فندقية وأمن ذكي 24/7',
    title_en: '24/7 White-Glove Concierge & Smart Security',
    desc_ar: 'فريق متخصص لتقديم خدمات الكونسيرج الشاملة (حجز الطيران والمطاعم، صيانة المنازل، العناية بالحدائق، التنظيف الفندقي) مع منظومة أمنية ذكية تضمن راحة البال التامة.',
    desc_en: 'A dedicated resident concierge team attending to private dining reservations, travel arrangements, housekeeping, and property care, anchored by 24/7 biometric security.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=85',
    features_ar: ['خدمات المساعد الشخصي وحجز المناسبات الخاصة', 'إدارة وتأجير العقار وتحصيل العوائد الاستثمارية', 'حراسة أمنية ذكية وكاميرات ذكاء اصطناعي 24/7'],
    features_en: ['Private lifestyle concierge & event reservations', 'Turnkey asset management & rental yield optimization', 'Biometric access control & 24/7 AI-monitored surveillance'],
  },
];

export default function AmenitiesSection() {
  const { lang, isRTL } = useLang();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePreview, setActivePreview] = useState<string>(amenitiesData[0].image);

  // Initialize One Green Way ScrollTrigger Animation Logic
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const components = el.querySelectorAll('.amenitie_component');
      if (!components.length) return;

      components.forEach((item) => {
        const line = item.querySelector('.amenitie-line');
        const title = item.querySelector('.amenitie-title_wrapper');
        const num = item.querySelector('.amenitie-num');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top bottom-=60',
            end: 'top 52%',
            scrub: 1,
          },
          defaults: {
            ease: 'power1.inOut',
          },
        });

        tl.fromTo(
          item,
          { opacity: 0.25, scale: 0.96, y: 50 },
          { opacity: 1, scale: 1, y: 0 }
        )
          .fromTo(line, { width: '0%' }, { width: '100%' }, '<')
          .fromTo(title, { scale: 0.85 }, { scale: 1 }, '<')
          .fromTo(num, { x: isRTL ? -30 : 30 }, { x: 0 }, '<');
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isRTL]);

  return (
    <section
      ref={containerRef}
      className="section-padding bg-ivory dark:bg-forest text-forest dark:text-ivory relative overflow-hidden border-t border-beige/70 dark:border-white/10"
    >
      {/* Subtle Architectural Grid Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#C6A45B_1px,transparent_1px)] [background-size:44px_44px] opacity-[0.05] pointer-events-none" />

      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gold/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-20 -right-32 w-80 h-80 bg-emerald/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container-custom relative z-10">
        
        {/* Section Header (One Green Way Spec) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 sm:mb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 dark:bg-emerald/80 border border-gold/40 text-emerald dark:text-gold text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase mb-4 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              {lang === 'ar' ? 'المرافق والخدمات الحصرية' : 'BESPOKE RESIDENTS AMENITIES'}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-sans text-forest dark:text-white leading-[1.14]">
              {lang === 'ar' ? 'نمط حياة استثنائي يجمع بين ' : 'Curated Amenities for '}
              <span className="font-editorial italic font-normal text-gold block sm:inline">
                {lang === 'ar' ? 'الرفاهية والراحة المطلقة' : 'An Unrivaled Lifestyle'}
              </span>
            </h2>
          </div>

          <button
            type="button"
            data-download-brochure=""
            data-project-name={lang === 'ar' ? 'مرافق الهشام الحصرية' : 'Al Hisham Bespoke Amenities'}
            className="btn-gold !px-7 !py-3.5 !rounded-xl text-xs font-bold uppercase tracking-wider self-start lg:self-end inline-flex items-center gap-2 shadow-xl cursor-pointer"
          >
            <span>{lang === 'ar' ? 'طلب كتيب المرافق VIP' : 'Download Amenities Brochure'}</span>
            <FiArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Amenities List - One Green Way Architecture */}
        <div className="space-y-8">
          {amenitiesData.map((amenity, idx) => (
            <div
              key={amenity.id}
              className="amenitie_component group rounded-2xl bg-white dark:bg-emerald-dark/60 border border-beige/80 dark:border-white/10 hover:border-gold/50 p-6 sm:p-10 transition-all duration-500 shadow-sm hover:shadow-xl relative overflow-hidden"
              onMouseEnter={() => setActivePreview(amenity.image)}
            >
              {/* Subtle hover gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald/5 via-transparent to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                
                {/* Number & Category Column (3 Cols) */}
                <div className="lg:col-span-3 flex lg:flex-col justify-between items-start">
                  <div
                    amenitie-number=""
                    data-amenitie-number={String(idx + 1).padStart(2, '0')}
                    className="amenitie-num font-editorial italic font-bold text-4xl sm:text-5xl text-gold"
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <span className="mt-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-textSecondary dark:text-ivory/70 px-3 py-1 rounded-full bg-ivory dark:bg-white/5 border border-beige/70 dark:border-white/10">
                    {lang === 'ar' ? amenity.category_ar : amenity.category_en}
                  </span>
                </div>

                {/* Title & Description Column (6 Cols) */}
                <div className="lg:col-span-6 space-y-3">
                  <div className="amenitie-title_wrapper origin-left rtl:origin-right">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-sans text-forest dark:text-white group-hover:text-emerald dark:group-hover:text-gold transition-colors leading-snug">
                      {lang === 'ar' ? amenity.title_ar : amenity.title_en}
                    </h3>
                  </div>

                  {/* Animated Gold Separator Line (One Green Way Spec: .amenitie-line) */}
                  <div className="w-full h-px bg-beige/60 dark:bg-white/10 relative overflow-hidden my-3">
                    <div className="amenitie-line h-full bg-gradient-to-r from-gold via-gold-light to-transparent" />
                  </div>

                  <p className="text-textSecondary text-xs sm:text-sm leading-relaxed font-light font-sans max-w-xl">
                    {lang === 'ar' ? amenity.desc_ar : amenity.desc_en}
                  </p>

                  {/* Highlights Bullet Tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {(lang === 'ar' ? amenity.features_ar : amenity.features_en).map((feat, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-[11px] text-textPrimary dark:text-gray-300 font-sans px-2.5 py-1 rounded-lg bg-ivory dark:bg-white/5 border border-beige/70 dark:border-white/5"
                      >
                        <FiCheck className="w-3 h-3 text-gold flex-shrink-0" />
                        <span>{feat}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Thumbnail Preview Card (3 Cols) */}
                <div className="lg:col-span-3">
                  <div className="relative h-44 sm:h-48 rounded-xl overflow-hidden border border-white/10 shadow-lg group-hover:border-gold/50 transition-colors">
                    <img
                      src={amenity.image}
                      alt={lang === 'ar' ? amenity.title_ar : amenity.title_en}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                      <span className="font-semibold tracking-wider text-[11px] uppercase text-gold">
                        {lang === 'ar' ? 'عرض المرفق' : 'Explore Amenity'}
                      </span>
                      <FiArrowUpRight className="w-4 h-4 text-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Bottom Editorial Callout */}
        <div className="mt-16 p-8 rounded-2xl bg-white dark:bg-emerald/30 border border-beige/80 dark:border-gold/30 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold text-xl flex-shrink-0">
              ❖
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-forest dark:text-white font-sans">
                {lang === 'ar' ? 'هل ترغب في جولة خاصة لاستكشاف كافة المرافق؟' : 'Desire a Private VIP Tour of All Amenities?'}
              </h4>
              <p className="text-xs sm:text-sm text-textSecondary font-light mt-0.5">
                {lang === 'ar'
                  ? 'يسعد مستشارنا العقاري المعتمد بمرافقتك في جولة حصرية وشرح كافة تفاصيل العضوية والامتيازات.'
                  : 'Our senior relationship manager will be delighted to accompany you on an exclusive private presentation.'}
              </p>
            </div>
          </div>

          <Link
            to="/contact"
            className="btn-gold !px-8 !py-3 !rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-md"
          >
            {lang === 'ar' ? 'حجز موعد جولة خاصة' : 'Schedule Private Tour'}
          </Link>
        </div>

      </div>
    </section>
  );
}
