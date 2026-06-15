import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLang } from '../context/LanguageContext';
import { projects } from '../data';

const WHATSAPP = '201103657888';

export default function ProjectDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { lang } = useLang();
  const [activeImage, setActiveImage] = useState(0);
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
      <Helmet>
        <title>{title} | الهشام للتطوير العقاري</title>
        <meta name="description" content={description.slice(0, 160)} />
      </Helmet>

      {/* Hero */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img src={project.images[activeImage]} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0">
          <div className="container-custom">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className={`px-3 py-1 text-xs font-semibold border rounded-full ${statusColors[project.status]}`}>
                {t(`projects.status_${project.status}` as any)}
              </span>
              <span className="text-gray-300 text-sm">{location}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">{title}</h1>
          </div>
        </div>
        {/* Thumbnail strip */}
        <div className="absolute bottom-0 right-8 rtl:left-8 rtl:right-auto flex gap-2 pb-4">
          {project.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`w-16 h-12 overflow-hidden border-2 transition-all ${i === activeImage ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-surface dark:bg-dark-100 border-b border-gray-100 dark:border-dark-300 py-3">
        <div className="container-custom flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-primary">{t('nav.home')}</Link>
          <span>/</span>
          <Link to="/projects" className="hover:text-primary">{t('nav.projects')}</Link>
          <span>/</span>
          <span className="text-primary dark:text-gold truncate">{title}</span>
        </div>
      </div>

      <section className="section-padding bg-white dark:bg-dark-100">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold text-dark dark:text-white mb-4">نبذة عن المشروع</h2>
                <div className="gold-divider" />
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg mt-4">{description}</p>
              </div>

              {/* Progress */}
              {project.status === 'ongoing' && (
                <div>
                  <h3 className="font-bold text-dark dark:text-white mb-3">نسبة الإنجاز</h3>
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>تقدم المشروع</span>
                    <span className="text-primary font-bold text-lg">{project.progress}%</span>
                  </div>
                  <div className="progress-bar h-3">
                    <div className="progress-fill h-full" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
              )}

              {/* Features */}
              <div>
                <h3 className="text-xl font-bold text-dark dark:text-white mb-6">المميزات والخدمات</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {project.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 p-4 bg-surface dark:bg-dark-200 border border-gray-100 dark:border-dark-300">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-dark dark:text-white text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map */}
              {project.mapEmbedUrl && (
                <div>
                  <h3 className="text-xl font-bold text-dark dark:text-white mb-4">موقع المشروع</h3>
                  <div className="h-64 overflow-hidden border border-gray-100 dark:border-dark-300">
                    <iframe
                      src={project.mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      title="Project Location"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Info Card */}
              <div className="bg-surface dark:bg-dark-200 p-6 border border-gray-100 dark:border-dark-300">
                <h3 className="font-bold text-dark dark:text-white mb-5 pb-3 border-b border-gray-100 dark:border-dark-300">
                  معلومات المشروع
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'الموقع', value: location, icon: '📍' },
                    { label: 'المساحة الإجمالية', value: `${project.area} م²`, icon: '📐' },
                    { label: 'سنة المشروع', value: project.year, icon: '📅' },
                    { label: 'عدد الوحدات', value: project.units ? `${project.units} وحدة` : '—', icon: '🏠' },
                    { label: 'حالة المشروع', value: t(`projects.status_${project.status}` as any), icon: '✅' },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                        <p className="text-dark dark:text-white font-medium text-sm">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inquiry Form */}
              <div className="bg-primary p-6 text-white">
                <h3 className="font-bold text-xl mb-2">طلب استفسار</h3>
                <p className="text-primary-lighter text-sm mb-5">سيتواصل معك فريقنا خلال 24 ساعة</p>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="الاسم الكامل"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/60 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                  <input
                    type="tel"
                    placeholder="رقم الهاتف"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/60 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                  <textarea
                    placeholder="رسالتك (اختياري)"
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/60 text-sm focus:outline-none focus:border-gold transition-colors resize-none"
                  />
                  <button
                    onClick={sendToWhatsApp}
                    className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba58] text-white font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    إرسال عبر واتساب
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
