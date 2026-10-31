import React, { useState } from 'react';
import SEO from '../components/ui/SEO';
import { useTranslation } from 'react-i18next';
import { useLang } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { formatUtmSummary, trackLeadEvent } from '../lib/utmTracker';

const WHATSAPP = '201103657888';

export default function Contact() {
  const { t } = useTranslation();
  const { lang, isRTL } = useLang();
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const fullMessage = `الموضوع: ${form.subject}\n\n${form.message}${formatUtmSummary()}`;
      const { error: dbErr } = await supabase
        .from('inquiries')
        .insert([{
          full_name: form.name,
          phone: form.phone,
          email: form.email || null,
          message: fullMessage,
          status: 'new',
          project_name: null,
          project_id: null,
        }]);

      if (dbErr) throw dbErr;

      trackLeadEvent('form_submission', {
        form_id: 'contact_page',
        subject: form.subject,
      });

      setSubmitted(true);
    } catch (err: any) {
      console.error('Contact form error:', err);
      setError(isRTL
        ? 'عذراً، حدث خطأ أثناء إرسال رسالتك. يرجى المحاولة مرة أخرى أو التواصل معنا عبر واتساب.'
        : 'Sorry, failed to send your message. Please try again or contact us via WhatsApp.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title={t('nav.contact')}
        description="تواصل مع الهشام للتطوير العقاري للحصول على استشارة عقارية أو الاستفسار عن مشاريعنا."
      />

      {/* Page Hero */}
      <div className="relative pt-32 pb-20 bg-dark overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/80 to-dark" />
        <div className="container-custom relative z-10 text-center">
          <p className="section-subtitle">{t('contact.subtitle')}</p>
          <h1 className="text-5xl font-bold text-white mb-4">{t('contact.title')}</h1>
          <div className="gold-divider mx-auto" />
        </div>
      </div>

      <section className="section-padding bg-ivory text-forest">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-forest mb-4 font-sans">
                {lang === 'ar' ? 'يسعدنا تواصلك مع مستشارينا' : 'Connect with Our Private Advisors'}
              </h2>
              <p className="text-textSecondary mb-10 leading-relaxed font-sans text-sm sm:text-base">
                {lang === 'ar'
                  ? 'سواء كان لديك استفسار عن مشاريعنا الفاخرة، أو ترغب في حجز جولة ميدانية خاصة، فريقنا الاستشاري جاهز لمساعدتك في كل خطوة.'
                  : 'Whether inquiring about our signature residences or planning a private site tour, our relationship team is here to assist you.'}
              </p>

              <div className="space-y-4">
                <div className="flex gap-4 p-5 bg-white rounded-2xl shadow-sm border border-beige/80">
                  <div className="w-12 h-12 bg-emerald/10 rounded-xl flex items-center justify-center text-emerald flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-forest mb-1 font-sans">{t('contact.address_title')}</h4>
                    <p className="text-textSecondary text-xs sm:text-sm leading-relaxed font-sans">
                      محور الأندلس، مدينة بني سويف، مصر
                      <br />
                      <a
                        href="https://maps.app.goo.gl/A8wEG6SzoFYk36a4A"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald hover:text-gold hover:underline mt-1 inline-block text-xs font-semibold"
                      >
                        {lang === 'ar' ? 'عرض على خرائط Google ↗' : 'View on Google Maps ↗'}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 bg-white rounded-2xl shadow-sm border border-beige/80">
                  <div className="w-12 h-12 bg-emerald/10 rounded-xl flex items-center justify-center text-emerald flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-forest mb-1 font-sans">{t('contact.phone_title')}</h4>
                    <a href={`tel:+${WHATSAPP}`} className="text-textSecondary text-xs sm:text-sm font-mono dir-ltr hover:text-emerald transition-colors block">
                      +20 110 365 7888
                    </a>
                  </div>
                </div>

                <div className="flex gap-4 p-5 bg-white rounded-2xl shadow-sm border border-beige/80">
                  <div className="w-12 h-12 bg-emerald/10 rounded-xl flex items-center justify-center text-emerald flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-forest mb-1 font-sans">{t('contact.email_title')}</h4>
                    <p className="text-textSecondary text-xs sm:text-sm font-sans">{t('contact.email_value')}</p>
                  </div>
                </div>

                {/* Direct WhatsApp link (exclusive to contact page) */}
                <a
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-5 bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl hover:bg-[#25D366]/20 transition-all shadow-sm group"
                >
                  <div className="w-11 h-11 bg-[#25D366] text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-forest text-sm font-sans">{lang === 'ar' ? 'تواصل مباشر عبر واتساب' : 'Direct WhatsApp Chat'}</p>
                    <p className="text-textSecondary text-xs mt-0.5 font-sans">{lang === 'ar' ? 'متاح للرد الفوري على مدار 24/7' : 'Available 24/7 for immediate assistance'}</p>
                  </div>
                </a>
              </div>

              {/* Social */}
              <div className="mt-8">
                <h4 className="font-bold text-forest mb-4 font-sans text-sm">{lang === 'ar' ? 'تابعنا على المنصات الرسمية' : 'Official Social Channels'}</h4>
                <div className="flex gap-3">
                  <a href="https://www.instagram.com/alhesham_realstate" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white border border-beige/80 rounded-xl flex items-center justify-center text-textSecondary hover:bg-emerald hover:text-white hover:border-emerald transition-all shadow-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                  <a href="https://www.tiktok.com/@alhesham_develop" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white border border-beige/80 rounded-xl flex items-center justify-center text-textSecondary hover:bg-emerald hover:text-white hover:border-emerald transition-all shadow-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" /></svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-beige/80">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-dark dark:text-white mb-2">
                    {isRTL ? 'تم إرسال رسالتك بنجاح!' : 'Message Sent!'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                    {isRTL
                      ? 'شكراً لتواصلك معنا. سيتواصل معك فريقنا في أقرب وقت.'
                      : 'Thank you for reaching out. Our team will contact you soon.'}
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', email: '', subject: '', message: '' }); }}
                    className="btn-primary"
                  >
                    {isRTL ? 'إرسال رسالة أخرى' : 'Send Another'}
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-forest mb-6 font-sans">
                    {lang === 'ar' ? 'طلب استشارة أو حجز زيارة خاصة' : 'Request Private Advisory or Site Visit'}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-textSecondary mb-2 font-sans">{t('contact.name')}</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-ivory border border-beige/80 focus:border-emerald focus:outline-none text-forest transition-colors text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-textSecondary mb-2 font-sans">{t('contact.phone')}</label>
                        <input
                          type="tel"
                          required
                          value={form.phone}
                          onChange={e => setForm({ ...form, phone: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-ivory border border-beige/80 focus:border-emerald focus:outline-none text-forest transition-colors dir-ltr text-left text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-textSecondary mb-2 font-sans">{t('contact.email')}</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-ivory border border-beige/80 focus:border-emerald focus:outline-none text-forest transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-textSecondary mb-2 font-sans">{t('contact.subject')}</label>
                      <input
                        type="text"
                        required
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-ivory border border-beige/80 focus:border-emerald focus:outline-none text-forest transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-textSecondary mb-2 font-sans">{t('contact.message')}</label>
                      <textarea
                        required
                        rows={4}
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-ivory border border-beige/80 focus:border-emerald focus:outline-none text-forest transition-colors resize-none text-sm"
                      />
                    </div>

                    {error && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 rounded-xl bg-emerald hover:bg-emerald-light text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer font-sans"
                    >
                      {submitting
                        ? (isRTL ? 'جاري إرسال الطلب...' : 'Sending Request...')
                        : (isRTL ? 'تأكيد إرسال الطلب' : 'Submit Private Request')}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="relative">
        <div className="h-[500px] w-full overflow-hidden">
          <iframe
            src="https://maps.google.com/maps?q=بني+سويف+محور+الاندلس+Beni+Suef+Egypt&t=&z=14&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'grayscale(20%) contrast(1.05)' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="موقع شركة الهشام للتطوير العقاري"
          />
        </div>
        {/* Floating card over map */}
        <div className="absolute bottom-6 ltr:left-6 rtl:right-6 bg-white dark:bg-dark-200 shadow-luxury-dark p-5 max-w-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-dark dark:text-white text-sm">الهشام للتطوير العقاري</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">محور الأندلس، بني سويف</p>
            </div>
          </div>
          <a
            href="https://maps.app.goo.gl/A8wEG6SzoFYk36a4A"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-primary dark:text-gold hover:underline"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            افتح في خرائط Google
          </a>
        </div>
      </section>
    </>
  );
}
