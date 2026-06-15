import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const WHATSAPP_NUMBER = '201103657888';

const serviceItems = [
  { icon: '🏗️', title: 'التطوير العقاري', desc: 'مشاريع سكنية وتجارية فاخرة', path: '/#services' },
  { icon: '📋', title: 'إدارة المشاريع', desc: 'إشراف متكامل على جميع المراحل', path: '/#services' },
  { icon: '📈', title: 'الاستثمار العقاري', desc: 'فرص استثمارية بعوائد مضمونة', path: '/#services' },
  { icon: '🏛️', title: 'الاستشارات الهندسية', desc: 'خبراء هندسيون ومعماريون', path: '/#services' },
  { icon: '📣', title: 'التسويق العقاري', desc: 'استراتيجيات تسويقية مبتكرة', path: '/#services' },
  { icon: '🔑', title: 'إدارة الأصول', desc: 'صون قيمة محفظتك العقارية', path: '/#services' },
];

const projectItems = [
  { title: 'المشاريع السكنية', path: '/projects?filter=residential' },
  { title: 'المشاريع التجارية', path: '/projects?filter=commercial' },
  { title: 'المشاريع المتعددة', path: '/projects?filter=mixed' },
  { title: 'المشاريع قيد التنفيذ', path: '/projects?status=ongoing' },
  { title: 'المشاريع المنجزة', path: '/projects?status=completed' },
  { title: 'المشاريع القادمة', path: '/projects?status=upcoming' },
];

export default function Navbar() {
  const { t } = useTranslation();
  const { lang, toggleLang, isRTL } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaMenu, setMegaMenu] = useState<string | null>(null);
  const megaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaMenu(null);
  }, [location]);

  // Close mega menu when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navLinks = [
    { key: 'nav.home', path: '/' },
    { key: 'nav.about', path: '/about' },
    { key: 'nav.projects', path: '/projects', hasMega: 'projects' },
    { key: 'nav.services', path: '/#services', hasMega: 'services' },
    { key: 'nav.blog', path: '/blog' },
    { key: 'nav.careers', path: '/careers' },
    { key: 'nav.contact', path: '/contact' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path.split('#')[0]);

  const textColor = scrolled
    ? 'text-dark dark:text-white hover:text-primary dark:hover:text-gold'
    : 'text-white hover:text-gold';

  const activeColor = scrolled ? 'text-primary dark:text-gold' : 'text-gold';

  return (
    <>
      {/* Mega Menu Backdrop */}
      <AnimatePresence>
        {megaMenu && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMegaMenu(null)}
          />
        )}
      </AnimatePresence>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 dark:bg-dark-100/95 backdrop-blur-md shadow-luxury py-2'
            : 'bg-transparent py-4'
        }`}
        ref={megaRef}
      >
        <div className="container-custom flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img
              src="/logo.png"
              alt="AL HISHAM DEVELOPMENT"
              className={`h-20 lg:h-28 w-auto object-contain transition-all duration-300 ${
                (!scrolled || isDark) ? 'brightness-0 invert' : ''
              }`}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map(({ key, path, hasMega }) => (
              <div key={key} className="relative">
                {hasMega ? (
                  <button
                    onMouseEnter={() => setMegaMenu(hasMega)}
                    className={`nav-link px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                      isActive(path) ? activeColor : textColor
                    }`}
                  >
                    {t(key)}
                    <svg
                      className={`w-3 h-3 transition-transform duration-200 ${megaMenu === hasMega ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <Link
                    to={path}
                    className={`nav-link px-4 py-2 text-sm font-medium transition-all duration-200 block ${
                      isActive(path) ? activeColor : textColor
                    }`}
                  >
                    {t(key)}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Lang Toggle */}
            <button
              onClick={toggleLang}
              className={`px-3 py-1.5 text-xs font-semibold border rounded-sm tracking-widest transition-all duration-200 ${
                scrolled
                  ? 'border-primary text-primary dark:border-gold dark:text-gold hover:bg-primary hover:text-white dark:hover:bg-gold dark:hover:text-dark'
                  : 'border-white/70 text-white hover:bg-white/10'
              }`}
            >
              {lang === 'ar' ? 'EN' : 'عر'}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 ${
                scrolled
                  ? 'bg-surface dark:bg-dark-300 hover:bg-primary/10 dark:hover:bg-gold/10'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
              ) : (
                <svg className={`w-4 h-4 ${scrolled ? 'text-dark dark:text-white' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن خدمات الهشام للتطوير العقاري')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary !py-2.5 !px-5 !text-xs"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              واتساب
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 transition-all duration-300 ${scrolled ? 'bg-dark dark:bg-white' : 'bg-white'} ${mobileOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`} />
            <span className={`block h-0.5 transition-all duration-300 ${scrolled ? 'bg-dark dark:bg-white' : 'bg-white'} ${mobileOpen ? 'opacity-0 w-0' : 'w-5'}`} />
            <span className={`block h-0.5 transition-all duration-300 ${scrolled ? 'bg-dark dark:bg-white' : 'bg-white'} ${mobileOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-4'}`} />
          </button>
        </div>

        {/* Mega Menu — Services */}
        <AnimatePresence>
          {megaMenu === 'services' && (
            <motion.div
              className="absolute left-0 right-0 top-full bg-white/95 dark:bg-dark-100/95 backdrop-blur-xl shadow-luxury-dark border-t border-gold/20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onMouseLeave={() => setMegaMenu(null)}
            >
              <div className="container-custom py-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-px bg-gold" />
                  <p className="text-gold text-xs font-semibold tracking-[0.3em] uppercase">خدماتنا المتكاملة</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {serviceItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.path}
                      className="flex gap-4 p-4 rounded-sm hover:bg-primary/5 dark:hover:bg-gold/5 transition-colors group"
                      onClick={() => setMegaMenu(null)}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-semibold text-dark dark:text-white text-sm group-hover:text-primary dark:group-hover:text-gold transition-colors">{item.title}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mega Menu — Projects */}
        <AnimatePresence>
          {megaMenu === 'projects' && (
            <motion.div
              className="absolute left-0 right-0 top-full bg-white/95 dark:bg-dark-100/95 backdrop-blur-xl shadow-luxury-dark border-t border-gold/20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onMouseLeave={() => setMegaMenu(null)}
            >
              <div className="container-custom py-8">
                <div className="flex gap-12">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="w-8 h-px bg-gold" />
                      <p className="text-gold text-xs font-semibold tracking-[0.3em] uppercase">تصفح المشاريع</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {projectItems.map((item) => (
                        <Link
                          key={item.title}
                          to={item.path}
                          className="flex items-center gap-2 px-4 py-3 hover:bg-primary/5 dark:hover:bg-gold/5 transition-colors group rounded-sm"
                          onClick={() => setMegaMenu(null)}
                        >
                          <span className="w-1 h-1 rounded-full bg-gold group-hover:w-3 transition-all" />
                          <span className="text-sm text-dark dark:text-white group-hover:text-primary dark:group-hover:text-gold transition-colors">{item.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="w-64 bg-primary/5 dark:bg-gold/5 p-6 rounded-sm">
                    <p className="text-dark dark:text-white font-bold mb-2 text-sm">هل تبحث عن عقار مثالي؟</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-4 leading-relaxed">تحدث مع فريقنا المتخصص للحصول على استشارة مجانية.</p>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold !py-2 !px-4 !text-xs w-full justify-center"
                      onClick={() => setMegaMenu(null)}
                    >
                      استشارة مجانية
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        {/* Drawer */}
        <div
          className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-80 bg-white dark:bg-dark-100 shadow-2xl transition-transform duration-500 flex flex-col ${
            mobileOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
          }`}
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-300">
            <img
              src="/logo.png"
              alt="AL HISHAM"
              className={`h-16 w-auto object-contain ${isDark ? 'brightness-0 invert' : ''}`}
            />
            <button
              onClick={() => setMobileOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-dark dark:text-white"
            >
              ✕
            </button>
          </div>

          {/* Mobile Links */}
          <nav className="flex-1 overflow-y-auto p-6 flex flex-col gap-1">
            {navLinks.map(({ key, path }, i) => (
              <Link
                key={key}
                to={path}
                style={{ animationDelay: `${i * 60}ms` }}
                className={`px-4 py-3 text-base font-medium border-b border-gray-50 dark:border-dark-300 transition-colors ${
                  isActive(path)
                    ? 'text-primary dark:text-gold'
                    : 'text-dark dark:text-white hover:text-primary dark:hover:text-gold'
                }`}
              >
                {t(key)}
              </Link>
            ))}
          </nav>

          {/* Mobile Footer Actions */}
          <div className="p-6 flex flex-col gap-3 border-t border-gray-100 dark:border-dark-300">
            <div className="flex gap-3">
              <button
                onClick={toggleLang}
                className="flex-1 py-2 text-sm font-semibold border border-primary text-primary dark:border-gold dark:text-gold rounded-sm"
              >
                {lang === 'ar' ? 'English' : 'العربية'}
              </button>
              <button
                onClick={toggleTheme}
                className="flex-1 py-2 text-sm font-semibold bg-surface dark:bg-dark-300 rounded-sm"
              >
                {isDark ? '☀️ فاتح' : '🌙 داكن'}
              </button>
            </div>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full justify-center"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              واتساب
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
