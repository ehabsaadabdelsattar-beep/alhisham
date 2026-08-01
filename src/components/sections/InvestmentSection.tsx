import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export default function InvestmentSection() {
  const { lang } = useLang();
  const { profile } = useAuth();
  const isInvestor = profile?.role === 'investor';

  return (
    <section className="section-padding bg-black text-white relative overflow-hidden border-t border-gold/20">
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 opacity-20 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/70 z-0" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Content (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <span className="section-subtitle">
              {lang === 'ar' ? 'الفرص الاستثمارية' : 'Investment Opportunities'}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              {lang === 'ar' ? 'استثمر بثقة في مستقبل التطوير العقاري' : 'Invest with Confidence in Real Estate Future'}
            </h2>
            <div className="gold-divider" />
            
            <p className="text-gray-300 text-base leading-relaxed font-light max-w-xl">
              {lang === 'ar'
                ? 'نوفر خيارات استثمارية فاخرة ومستدامة تم دراستها بعناية لتحقيق أفضل العوائد المالية وحماية قيمة الأصول على المدى الطويل.'
                : 'Delivering luxury real estate investment solutions engineered for capital growth, risk optimization, and high yield portfolio performance.'}
            </p>

            <div className="grid sm:grid-cols-3 gap-6 pt-4 border-t border-white/10">
              <div>
                <p className="text-2xl font-bold text-gradient-gold font-english">18-24%</p>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                  {lang === 'ar' ? 'متوسط العائد السنوي' : 'Target Annual ROI'}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gradient-gold font-english">100%</p>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                  {lang === 'ar' ? 'أصول موثوقة' : 'Prime Asset Backed'}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gradient-gold font-english">15+ YRS</p>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                  {lang === 'ar' ? 'خبرة استثمارية' : 'Market Expertise'}
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-4">
              {isInvestor ? (
                <Link to="/investor" className="btn-gold !px-8 !py-4">
                  {lang === 'ar' ? 'لوحة تحكم المستثمر' : 'Investor Dashboard'}
                </Link>
              ) : (
                <Link to="/contact" className="btn-gold !px-8 !py-4">
                  {lang === 'ar' ? 'طلب استشارة استثمارية' : 'Request Investment Advisory'}
                </Link>
              )}
              <Link to="/projects" className="btn-outline !px-8 !py-4">
                {lang === 'ar' ? 'تصفح محفظة المشاريع' : 'View Portfolio'}
              </Link>
            </div>
          </div>

          {/* Investment Highlight Card (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="p-8 bg-white/5 backdrop-blur-xl border border-gold/30 shadow-2xl space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-px bg-gold" />
                <h3 className="text-gold font-bold text-xs uppercase tracking-widest">
                  {lang === 'ar' ? 'برنامج الهشام للاستثمار' : 'Al Hisham Program'}
                </h3>
              </div>
              <h4 className="text-2xl font-bold text-white">
                {lang === 'ar' ? 'حلول استثمارية مرنة تناسب تطلعاتك' : 'Flexible Investment Tailored for Growth'}
              </h4>
              <p className="text-gray-300 text-xs leading-relaxed font-light">
                {lang === 'ar'
                  ? 'يتيح لك برنامجنا الاستثماري المشاركة المباشرة في المشاريع العقارية الكبرى مع الحصول على تقارير دورية وشفافية كاملة.'
                  : 'Direct participation in premier commercial and residential assets backed by comprehensive performance reporting.'}
              </p>

              <div className="space-y-3 pt-2">
                {[
                  lang === 'ar' ? 'تقارير أداء دورية للمستثمرين' : 'Regular Investor Performance Reporting',
                  lang === 'ar' ? 'إدارة متكاملة للمخاطر والأصول' : 'Integrated Asset Risk Management',
                  lang === 'ar' ? 'عقود استثمارية معتمدة وموثقة' : 'Verified Legal & Equity Contracts'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs text-gray-200">
                    <span className="w-1.5 h-1.5 bg-gold flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
