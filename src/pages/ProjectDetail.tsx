import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import { useLang } from '../context/LanguageContext';
import { projects } from '../data';
import SEO from '../components/ui/SEO';

const WHATSAPP = '201103657888';

export default function ProjectDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { lang } = useLang();
  const [form, setForm] = useState({ name: '', phone: '', message: '' });

  const project = projects.find(p => p.id === id);
  if (!project) return <Navigate to="/projects" />;

  const title = lang === 'ar' ? project.titleAr : project.titleEn;
  const location = lang === 'ar' ? project.locationAr : project.locationEn;
  const description = lang === 'ar' ? project.descriptionAr : project.descriptionEn;

  const sendToWhatsApp = () => {
    const msg = encodeURIComponent(
      `مرحباً، أود الاستفسار عن مشروع: ${title}\nالموقع: ${location}\nالاسم: ${form.name}\nالهاتف: ${form.phone}\nالرسالة: ${form.message}`
    );
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank');
  };

  const statusColors: Record<string, string> = {
    completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    ongoing: 'bg-gold/10 text-gold border-gold/30',
    upcoming: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  };

  return (
    <>
      <SEO 
        title={title}
        description={description.slice(0, 160)}
        image={project.image}
      />

      {/* Hero Gallery with Swiper */}
      <div className="relative h-[75vh] min-h-[500px] overflow-hidden bg-dark">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          effect="fade"
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          className="w-full h-full"
        >
          {project.images.map((img, i) => (
            <SwiperSlide key={i}>
              <div className="relative w-full h-full">
                <img src={img} alt={`${title} - ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute bottom-12 left-0 right-0 z-10 pointer-events-none">
          <div className="container-custom">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`px-4 py-1.5 text-xs font-semibold border rounded-full backdrop-blur-md ${statusColors[project.status]}`}>
                  {t(`projects.status_${project.status}` as any)}
                </span>
                <span className="text-gray-300 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {location}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">{title}</h1>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-surface dark:bg-dark-100 border-b border-gray-100 dark:border-dark-300 py-4 sticky top-16 lg:top-20 z-40 shadow-sm backdrop-blur-md bg-white/80 dark:bg-dark-100/80">
        <div className="container-custom flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/" className="hover:text-primary dark:hover:text-gold transition-colors">{t('nav.home')}</Link>
          <span>/</span>
          <Link to="/projects" className="hover:text-primary dark:hover:text-gold transition-colors">{t('nav.projects')}</Link>
          <span>/</span>
          <span className="text-primary dark:text-gold truncate font-semibold">{title}</span>
        </div>
      </div>

      <section className="section-padding bg-surface dark:bg-dark-100">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Description */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h2 className="text-2xl font-bold text-dark dark:text-white mb-4">
                  {lang === 'ar' ? 'نبذة عن المشروع' : 'Project Overview'}
                </h2>
                <div className="gold-divider" />
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg mt-6">{description}</p>
              </motion.div>

              {/* Progress */}
              {project.status === 'ongoing' && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <div className="bg-white dark:bg-dark-200 p-8 rounded-sm premium-shadow dark:premium-shadow-dark border border-gray-100 dark:border-dark-300">
                    <h3 className="font-bold text-dark dark:text-white mb-4 text-xl">
                      {lang === 'ar' ? 'نسبة الإنجاز' : 'Completion Rate'}
                    </h3>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span>{lang === 'ar' ? 'تقدم الأعمال الإنشائية' : 'Construction Progress'}</span>
                      <span className="text-primary dark:text-gold font-bold text-2xl">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-dark-400 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        className="bg-gradient-to-r from-primary to-primary-light dark:from-gold dark:to-yellow-300 h-full rounded-full" 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${project.progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        viewport={{ once: true }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Features */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h3 className="text-2xl font-bold text-dark dark:text-white mb-6">
                  {lang === 'ar' ? 'المميزات والخدمات' : 'Features & Amenities'}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {project.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-white dark:bg-dark-200 premium-shadow dark:premium-shadow-dark border border-gray-100 dark:border-dark-300 rounded-sm hover:-translate-y-1 transition-transform">
                      <div className="w-10 h-10 bg-primary/10 dark:bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-primary dark:text-gold" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-dark dark:text-white font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Map */}
              {project.mapEmbedUrl && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <h3 className="text-2xl font-bold text-dark dark:text-white mb-6">
                    {lang === 'ar' ? 'موقع المشروع' : 'Project Location'}
                  </h3>
                  <div className="h-96 overflow-hidden rounded-sm premium-shadow dark:premium-shadow-dark border border-gray-100 dark:border-dark-300">
                    <iframe
                      src={project.mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0, filter: 'grayscale(15%) contrast(1.1)' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Project Location"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Project Info Card */}
              <motion.div 
                className="bg-white dark:bg-dark-200 p-8 rounded-sm premium-shadow dark:premium-shadow-dark border border-gray-100 dark:border-dark-300 sticky top-32"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="font-bold text-xl text-dark dark:text-white mb-6 pb-4 border-b border-gray-100 dark:border-dark-300">
                  {lang === 'ar' ? 'معلومات المشروع' : 'Project Information'}
                </h3>
                <div className="space-y-6">
                  {[
                    { label: lang === 'ar' ? 'الموقع' : 'Location', value: location, icon: '📍' },
                    { label: lang === 'ar' ? 'المساحة الإجمالية' : 'Total Area', value: `${project.area} م²`, icon: '📐' },
                    { label: lang === 'ar' ? 'سنة المشروع' : 'Project Year', value: project.year, icon: '📅' },
                    { label: lang === 'ar' ? 'عدد الوحدات' : 'Total Units', value: project.units ? `${project.units} وحدة` : '—', icon: '🏠' },
                    { label: lang === 'ar' ? 'حالة المشروع' : 'Status', value: t(`projects.status_${project.status}` as any), icon: '✅' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface dark:bg-dark-300 flex items-center justify-center text-lg flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                        <p className="text-dark dark:text-white font-semibold">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-300">
                  <h4 className="font-bold text-dark dark:text-white mb-4">
                    {lang === 'ar' ? 'مهتم بهذا المشروع؟' : 'Interested in this project?'}
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-surface dark:bg-dark-300 border border-gray-200 dark:border-dark-400 text-dark dark:text-white text-sm focus:outline-none focus:border-primary dark:focus:border-gold transition-colors rounded-sm"
                    />
                    <input
                      type="tel"
                      placeholder={lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-surface dark:bg-dark-300 border border-gray-200 dark:border-dark-400 text-dark dark:text-white text-sm focus:outline-none focus:border-primary dark:focus:border-gold transition-colors rounded-sm"
                    />
                    <button
                      onClick={sendToWhatsApp}
                      className="w-full py-4 bg-[#25D366] hover:bg-[#20ba58] text-white font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 rounded-sm shadow-lg shadow-[#25D366]/20"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      {lang === 'ar' ? 'طلب استشارة عبر واتساب' : 'Consult via WhatsApp'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
