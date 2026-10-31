import React, { useState, useEffect, useRef } from 'react';
import { useBrochureModal } from '../../context/BrochureModalContext';
import { useLang } from '../../context/LanguageContext';
import { inquiriesService } from '../../services/inquiries';
import { formatUtmSummary, trackLeadEvent } from '../../lib/utmTracker';
import { gsap } from 'gsap';

export const BrochureModal: React.FC = () => {
  const { isOpen, requestData, closeBrochureModal } = useBrochureModal();
  const { lang, isRTL } = useLang();
  const isRtl = isRTL ?? (lang === 'ar');

  const modalRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [docType, setDocType] = useState<'brochure' | 'masterplan' | 'both'>('brochure');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [allowWhatsApp, setAllowWhatsApp] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync default type when requestData changes
  useEffect(() => {
    if (requestData?.defaultType) {
      setDocType(requestData.defaultType);
    } else {
      setDocType('brochure');
    }
    setIsSuccess(false);
    setErrorMessage(null);
  }, [requestData]);

  // Pause Lenis smooth scrolling when modal is open
  useEffect(() => {
    const lenis = (window as any).lenis || (window as any).__lenis;
    if (isOpen) {
      lenis?.stop?.();
      document.body.style.overflow = 'hidden';
    } else {
      lenis?.start?.();
      document.body.style.overflow = '';
    }
    return () => {
      lenis?.start?.();
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // GSAP animation for opening
  useEffect(() => {
    if (isOpen && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.95, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [isOpen]);

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeBrochureModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeBrochureModal]);

  if (!isOpen || !requestData) return null;

  const projectName = requestData.projectName || (isRtl ? 'مشروعات الهشام للتطوير' : 'Al Hisham Developments');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setErrorMessage(isRtl ? 'يرجى إدخال الاسم ورقم الهاتف للمتابعة' : 'Please provide your name and phone number');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const docLabel =
        docType === 'masterplan'
          ? isRtl ? 'المخطط العام (Master Plan)' : 'Master Plan'
          : docType === 'both'
          ? isRtl ? 'البروشور والمخطط العام الشامل' : 'Comprehensive Brochure & Master Plan'
          : isRtl ? 'البروشور التعريفي (Brochure)' : 'Project Brochure';

      const utmInfo = formatUtmSummary();
      const message = `[طلب تحميل فوري: ${docLabel}] - المشروع: ${projectName} - واتساب معتمد: ${
        allowWhatsApp ? 'نعم' : 'لا'
      }${utmInfo}`;

      // Persist in Supabase inquiries table
      await inquiriesService.createInquiry({
        full_name: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim(),
        project_name: projectName,
        project_id: requestData.projectId || null,
        message,
      });

      // Track conversion event (compatible with GTM / GA4 triggers)
      const eventName = docType === 'masterplan' ? 'download_masterplan' : 'download_brochure';
      trackLeadEvent(eventName, {
        project_name: projectName,
        document_type: docType,
        allow_whatsapp: allowWhatsApp,
      });

      // Auto-trigger direct document download if URL exists
      const targetUrl =
        docType === 'masterplan'
          ? requestData.masterplanUrl || requestData.brochureUrl
          : requestData.brochureUrl || requestData.masterplanUrl;

      if (targetUrl) {
        const link = document.createElement('a');
        link.href = targetUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = `${projectName}_${docType}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error submitting brochure request:', err);
      setErrorMessage(
        isRtl
          ? 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى أو التواصل معنا عبر واتساب.'
          : 'An unexpected error occurred. Please try again or reach out directly on WhatsApp.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === modalRef.current) closeBrochureModal();
      }}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        ref={cardRef}
        className="relative w-full max-w-xl bg-gradient-to-b from-[#143027] to-[#0A1A15] border border-[#C6A45B]/30 rounded-2xl md:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-6 md:p-10 text-white overflow-hidden"
      >
        {/* Luxury Gold Accents */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C6A45B] to-transparent opacity-75" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#C6A45B]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeBrochureModal}
          className="absolute top-5 right-5 md:top-7 md:right-7 w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-[#C6A45B]/60 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer z-10"
          aria-label="Close Modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isSuccess ? (
          /* SUCCESS STATE */
          <div className="py-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#103C32] border border-[#C6A45B] flex items-center justify-center text-[#C6A45B] shadow-[0_0_30px_rgba(198,164,91,0.25)]">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
                {isRtl ? 'تم تأكيد طلبك بنجاح' : 'Request Confirmed'}
              </h3>
              <p className="text-sm md:text-base text-gray-300 max-w-md mx-auto leading-relaxed">
                {isRtl
                  ? `شكراً لاهتمامك بمشروع "${projectName}". جاري بدء التحميل الفوري، وسيقوم مستشارك العقاري الخاص بالتواصل معك عبر واتساب لتزويدك بأدق التفاصيل والأسعار الحصرية.`
                  : `Thank you for your interest in "${projectName}". Your download is starting, and your private investment advisor will be in touch via WhatsApp with exclusive pricing.`}
              </p>
            </div>

            {/* Direct Re-download button if popup blocked */}
            {(requestData.brochureUrl || requestData.masterplanUrl) && (
              <a
                href={requestData.brochureUrl || requestData.masterplanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C6A45B] text-black font-semibold hover:bg-[#D4B36A] transition-all shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>{isRtl ? 'تحميل يدوي إذا لم يبدأ تلقائياً' : 'Download Manually'}</span>
              </a>
            )}

            <div>
              <button
                onClick={closeBrochureModal}
                className="text-xs uppercase tracking-widest text-[#C6A45B] hover:text-white transition-colors underline cursor-pointer"
              >
                {isRtl ? 'إغلاق النافذة' : 'Close Window'}
              </button>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C6A45B]/10 border border-[#C6A45B]/30 text-[#C6A45B] text-xs font-semibold tracking-wider uppercase">
                <span>✦</span>
                <span>{isRtl ? 'وصول حصري للمستندات' : 'VIP Document Access'}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {isRtl ? `كتيب ومخطط ${projectName}` : `${projectName} Portfolio`}
              </h3>
              <p className="text-xs md:text-sm text-gray-400">
                {isRtl
                  ? 'احصل على الكتيب الفني الكامل، المخطط المعماري، وجدول المساحات والتسليم الاستثماري المحدث.'
                  : 'Receive the complete architectural prospectus, master plan layouts, and current private pricing schedule.'}
              </p>
            </div>

            {/* Document Preference Selector */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-black/40 border border-white/10 rounded-xl">
              <button
                type="button"
                onClick={() => setDocType('brochure')}
                className={`py-2 px-3 text-xs md:text-sm rounded-lg font-medium transition-all cursor-pointer ${
                  docType === 'brochure'
                    ? 'bg-[#C6A45B] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {isRtl ? 'الكتيب التعريفي' : 'Brochure'}
              </button>
              <button
                type="button"
                onClick={() => setDocType('masterplan')}
                className={`py-2 px-3 text-xs md:text-sm rounded-lg font-medium transition-all cursor-pointer ${
                  docType === 'masterplan'
                    ? 'bg-[#C6A45B] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {isRtl ? 'المخطط العام' : 'Master Plan'}
              </button>
              <button
                type="button"
                onClick={() => setDocType('both')}
                className={`py-2 px-3 text-xs md:text-sm rounded-lg font-medium transition-all cursor-pointer ${
                  docType === 'both'
                    ? 'bg-[#C6A45B] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {isRtl ? 'الباقة الشاملة' : 'Full Package'}
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-xs md:text-sm">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1.5 font-medium">
                  {isRtl ? 'الاسم الكريم *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isRtl ? 'مثال: محمد السعيد' : 'e.g. Alexander Vance'}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#C6A45B] transition-colors"
                />
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1.5 font-medium">
                  {isRtl ? 'رقم الهاتف / واتساب *' : 'Phone / WhatsApp *'}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+20 100 000 0000"
                  dir="ltr"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#C6A45B] transition-colors text-left"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1.5 font-medium">
                  {isRtl ? 'البريد الإلكتروني (اختياري)' : 'Email Address (Optional)'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vip@domain.com"
                  dir="ltr"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#C6A45B] transition-colors text-left"
                />
              </div>

              {/* WhatsApp Consent */}
              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={allowWhatsApp}
                  onChange={(e) => setAllowWhatsApp(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-700 bg-white/5 text-[#C6A45B] focus:ring-[#C6A45B]"
                />
                <span className="text-xs text-gray-400 leading-normal">
                  {isRtl
                    ? 'أوافق على استلام تحديثات التوفر وجدول الأسعار ووثائق الاستثمار الحصرية عبر تطبيق واتساب.'
                    : 'I agree to receive availability updates, private pricing, and investor documents via WhatsApp.'}
                </span>
              </label>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-4 px-6 rounded-xl bg-gradient-to-r from-[#C6A45B] to-[#D4B36A] hover:from-[#D4B36A] hover:to-[#E5C780] text-black font-bold tracking-wider text-sm uppercase transition-all shadow-[0_10px_30px_rgba(198,164,91,0.3)] hover:shadow-[0_15px_40px_rgba(198,164,91,0.45)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-5 h-5 text-black" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>{isRtl ? 'جاري تأكيد الطلب...' : 'Processing Request...'}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>{isRtl ? 'تحميل المستند الفوري الآن' : 'Download Document Now'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
