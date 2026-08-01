import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getRoleLabel } from '../../lib/permissions';
import {
  FiSun, FiMoon, FiUser, FiLogOut, FiSettings,
  FiChevronDown, FiX, FiShield, FiBarChart2, FiGlobe
} from 'react-icons/fi';

const WHATSAPP_NUMBER = '201103657888';

// Generate initials from name, e.g. "Ahmed Mohamed" → "AM"
function getInitials(name: string | null): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');
}

function AvatarDisplay({ avatarUrl, fullName, size = 'md' }: { avatarUrl: string | null; fullName: string | null; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={fullName || 'User'}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-gold/40 shadow-md`}
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-gold/90 to-yellow-600 flex items-center justify-center font-bold text-dark ring-2 ring-gold/40 shadow-md`}>
      {getInitials(fullName)}
    </div>
  );
}

export default function Navbar() {
  const { t } = useTranslation();
  const { lang, toggleLang, isRTL } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaMenu, setMegaMenu] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { session, profile, loading, signOut, canAccessAdmin } = useAuth();
  const isLoggedIn = !!session;

  const navLinks = [
    { key: 'nav.home', path: '/' },
    { key: 'nav.about', path: '/about' },
    { key: 'nav.projects', path: '/projects', hasMega: 'projects' },
    { key: 'nav.services', path: '/#services', hasMega: 'services' },
    { key: 'nav.blog', path: '/blog' },
    { key: 'nav.careers', path: '/careers' },
    { key: 'nav.contact', path: '/contact' },
  ];

  const serviceItems = [
    { icon: '🏗️', title: lang === 'ar' ? 'التطوير العقاري' : 'Real Estate Development', desc: lang === 'ar' ? 'مشاريع سكنية وتجارية فاخرة' : 'Premium residential & commercial projects', path: '/#services' },
    { icon: '📋', title: lang === 'ar' ? 'إدارة المشاريع' : 'Project Management', desc: lang === 'ar' ? 'إشراف متكامل على جميع المراحل' : 'End-to-end project oversight', path: '/#services' },
    { icon: '📈', title: lang === 'ar' ? 'الاستثمار العقاري' : 'Real Estate Investment', desc: lang === 'ar' ? 'فرص استثمارية بعوائد مضمونة' : 'Investment opportunities with guaranteed returns', path: '/#services' },
    { icon: '🏛️', title: lang === 'ar' ? 'الاستشارات الهندسية' : 'Engineering Consultancy', desc: lang === 'ar' ? 'خبراء هندسيون ومعماريون' : 'Expert architects & engineers', path: '/#services' },
    { icon: '📣', title: lang === 'ar' ? 'التسويق العقاري' : 'Real Estate Marketing', desc: lang === 'ar' ? 'استراتيجيات تسويقية مبتكرة' : 'Innovative marketing strategies', path: '/#services' },
    { icon: '🔑', title: lang === 'ar' ? 'إدارة الأصول' : 'Asset Management', desc: lang === 'ar' ? 'صون قيمة محفظتك العقارية' : 'Preserve & grow portfolio', path: '/#services' },
  ];

  const projectItems = [
    { title: lang === 'ar' ? 'المشاريع السكنية' : 'Residential Projects', path: '/projects?filter=residential' },
    { title: lang === 'ar' ? 'المشاريع التجارية' : 'Commercial Projects', path: '/projects?filter=commercial' },
    { title: lang === 'ar' ? 'المشاريع المتعددة' : 'Mixed-Use Projects', path: '/projects?filter=mixed' },
    { title: lang === 'ar' ? 'المشاريع قيد التنفيذ' : 'Under Construction', path: '/projects?status=ongoing' },
    { title: lang === 'ar' ? 'المشاريع المنجزة' : 'Completed Projects', path: '/projects?status=completed' },
    { title: lang === 'ar' ? 'المشاريع القادمة' : 'Upcoming Projects', path: '/projects?status=upcoming' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaMenu(null);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaMenu(null);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path.split('#')[0]);

  const textColor = scrolled
    ? 'text-dark dark:text-white hover:text-gold dark:hover:text-gold'
    : 'text-white/90 hover:text-gold';
  const activeColor = 'text-gold font-semibold';

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    await signOut();
    navigate('/');
  };

  const roleLabel: Record<string, string> = {
    admin: 'Super Admin',
    editor: lang === 'ar' ? 'محرر' : 'Editor',
    investor: lang === 'ar' ? 'مستثمر' : 'Investor',
    customer: lang === 'ar' ? 'عميل' : 'Customer',
  };

  return (
    <>
      {/* Mega Menu Backdrop */}
      <AnimatePresence>
        {megaMenu && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMegaMenu(null)}
          />
        )}
      </AnimatePresence>

      <header
        ref={megaRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 dark:bg-black/90 backdrop-blur-2xl shadow-2xl border-b border-gold/15 py-3'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5'
        }`}
      >
        <div className="container-custom flex items-center justify-between gap-6">
          {/* Brand Logo - 30% Prominent */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <img
              src="/logo.png"
              alt="AL HISHAM DEVELOPMENT"
              className={`h-20 sm:h-24 lg:h-[110px] w-auto object-contain transition-all duration-300 ${
                (!scrolled || isDark) ? 'brightness-0 invert' : ''
              } group-hover:scale-105`}
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ key, path, hasMega }) => (
              <div key={path} className="relative">
                {hasMega ? (
                  <button
                    onMouseEnter={() => setMegaMenu(hasMega)}
                    aria-label={t(key)}
                    className={`nav-link px-3.5 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-200 flex items-center gap-1 ${
                      isActive(path) ? activeColor : textColor
                    }`}
                  >
                    {t(key)}
                    <FiChevronDown
                      className={`w-3 h-3 transition-transform duration-200 ${megaMenu === hasMega ? 'rotate-180 text-gold' : ''}`}
                    />
                  </button>
                ) : (
                  <Link
                    to={path}
                    className={`nav-link px-3.5 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-200 block ${
                      isActive(path) ? activeColor : textColor
                    }`}
                  >
                    {t(key)}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Action Controls */}
          <div className="hidden lg:flex items-center gap-3">

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              title={lang === 'ar' ? 'Switch to English' : 'التحويل للغة العربية'}
              aria-label="Toggle language"
              className={`px-3 py-1.5 rounded-none text-xs font-bold tracking-widest transition-all duration-200 flex items-center gap-1.5 border ${
                scrolled
                  ? 'border-gray-200 dark:border-gray-800 text-dark dark:text-white hover:border-gold hover:text-gold'
                  : 'border-white/30 text-white hover:border-gold hover:text-gold'
              }`}
            >
              <FiGlobe className="w-3.5 h-3.5 text-gold" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Dark/Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Light Mode' : 'Dark Mode'}
              className={`w-9 h-9 flex items-center justify-center transition-all duration-200 ${
                scrolled
                  ? 'bg-gray-100 dark:bg-gray-900 hover:bg-gold/10 text-dark dark:text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {isDark
                ? <FiSun className="w-4 h-4 text-gold" />
                : <FiMoon className={`w-4 h-4 ${scrolled ? 'text-dark dark:text-white' : 'text-white'}`} />
              }
            </button>

            {/* Auth State Control */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
            ) : isLoggedIn && profile ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="Account menu"
                  className={`flex items-center gap-2 px-2.5 py-1 transition-all border ${
                    scrolled
                      ? 'border-gray-200 dark:border-gray-800 hover:border-gold'
                      : 'border-white/30 hover:border-gold'
                  }`}
                >
                  <AvatarDisplay avatarUrl={profile.avatar_url} fullName={profile.full_name} size="sm" />
                  <span className={`text-xs font-bold uppercase tracking-wider hidden xl:block ${scrolled ? 'text-dark dark:text-white' : 'text-white'}`}>
                    {profile.full_name?.split(' ')[0] || (lang === 'ar' ? 'حسابي' : 'Account')}
                  </span>
                  <FiChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${userMenuOpen ? 'rotate-180 text-gold' : ''} ${scrolled ? 'text-dark dark:text-white' : 'text-white'}`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-60 bg-white dark:bg-black rounded-none shadow-2xl border border-gold/20 overflow-hidden z-50`}
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800/80 bg-gold/5">
                        <div className="flex items-center gap-3">
                          <AvatarDisplay avatarUrl={profile.avatar_url} fullName={profile.full_name} />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-dark dark:text-white truncate">{profile.full_name}</p>
                            <p className="text-xs text-gray-400 truncate">{profile.email}</p>
                          </div>
                        </div>
                        <span className="mt-2 inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 bg-gold/15 text-gold border border-gold/30 font-semibold">
                          {roleLabel[profile.role] || getRoleLabel(profile.role, lang === 'ar' ? 'ar' : 'en')}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300 hover:bg-gold/10 hover:text-gold transition-colors"
                        >
                          <FiUser className="w-4 h-4 text-gold" /> {lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
                        </Link>
                        {canAccessAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300 hover:bg-gold/10 hover:text-gold transition-colors font-bold text-gold"
                          >
                            <FiShield className="w-4 h-4" /> {lang === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard'}
                          </Link>
                        )}
                        {profile.role === 'investor' && (
                          <Link
                            to="/investor"
                            className="flex items-center gap-3 px-4 py-2.5 text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300 hover:bg-gold/10 hover:text-gold transition-colors"
                          >
                            <FiBarChart2 className="w-4 h-4 text-gold" /> {lang === 'ar' ? 'لوحة المستثمر' : 'Investor Dashboard'}
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300 hover:bg-gold/10 hover:text-gold transition-colors"
                        >
                          <FiSettings className="w-4 h-4 text-gold" /> {lang === 'ar' ? 'الإعدادات' : 'Settings'}
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-800 py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs uppercase tracking-wider text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <FiLogOut className="w-4 h-4" /> {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="btn-outline !py-2 !px-4 !text-xs"
                >
                  {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
                </Link>
                <Link
                  to="/register"
                  className="btn-gold !py-2 !px-4 !text-xs"
                >
                  {lang === 'ar' ? 'حساب جديد' : 'Register'}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 flex-shrink-0"
          >
            <span className={`block h-0.5 transition-all duration-300 ${scrolled ? 'bg-dark dark:bg-white' : 'bg-white'} ${mobileOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`} />
            <span className={`block h-0.5 transition-all duration-300 ${scrolled ? 'bg-dark dark:bg-white' : 'bg-white'} ${mobileOpen ? 'opacity-0 w-0' : 'w-5'}`} />
            <span className={`block h-0.5 transition-all duration-300 ${scrolled ? 'bg-dark dark:bg-white' : 'bg-white'} ${mobileOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-4'}`} />
          </button>
        </div>

        {/* Mega Menu - Services */}
        <AnimatePresence>
          {megaMenu === 'services' && (
            <motion.div
              className="absolute left-0 right-0 top-full bg-black/95 backdrop-blur-2xl shadow-2xl border-t border-gold/30 text-white"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onMouseLeave={() => setMegaMenu(null)}
            >
              <div className="container-custom py-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-px bg-gold" />
                  <p className="text-gold text-xs font-bold tracking-[0.3em] uppercase">
                    {lang === 'ar' ? 'خدماتنا الفاخرة' : 'Luxury Services'}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {serviceItems.map(item => (
                    <Link
                      key={item.title}
                      to={item.path}
                      className="flex gap-4 p-4 hover:bg-gold/10 transition-colors group border border-white/5 hover:border-gold/30"
                      onClick={() => setMegaMenu(null)}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-bold text-white text-sm group-hover:text-gold transition-colors">{item.title}</p>
                        <p className="text-gray-400 text-xs mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mega Menu - Projects */}
        <AnimatePresence>
          {megaMenu === 'projects' && (
            <motion.div
              className="absolute left-0 right-0 top-full bg-black/95 backdrop-blur-2xl shadow-2xl border-t border-gold/30 text-white"
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
                      <p className="text-gold text-xs font-bold tracking-[0.3em] uppercase">
                        {lang === 'ar' ? 'تصفح المشاريع' : 'Browse Portfolio'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {projectItems.map(item => (
                        <Link
                          key={item.title}
                          to={item.path}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gold/10 transition-colors group border border-white/5 hover:border-gold/30"
                          onClick={() => setMegaMenu(null)}
                        >
                          <span className="w-1.5 h-1.5 bg-gold group-hover:w-4 transition-all" />
                          <span className="text-sm font-semibold text-white group-hover:text-gold transition-colors">{item.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="w-72 bg-gold/10 border border-gold/25 p-6 flex flex-col justify-between">
                    <div>
                      <p className="text-white font-bold mb-2 text-sm uppercase tracking-wider">
                        {lang === 'ar' ? 'استشارة عقارية فاخرة' : 'Luxury Real Estate Consultation'}
                      </p>
                      <p className="text-gray-400 text-xs leading-relaxed mb-4">
                        {lang === 'ar' ? 'تحدث مع خبراء الاستثمار والتطوير العقاري في الهشام.' : 'Speak directly with Al Hisham real estate development advisors.'}
                      </p>
                    </div>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold !py-2.5 !px-4 !text-xs justify-center"
                      onClick={() => setMegaMenu(null)}
                    >
                      {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className={`fixed top-0 bottom-0 ${isRTL ? 'right-0' : 'left-0'} z-50 w-80 max-w-[90vw] bg-black text-white border-l border-gold/20 shadow-2xl flex flex-col lg:hidden`}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                <img
                  src="/logo.png"
                  alt="AL HISHAM"
                  className="h-12 w-auto object-contain brightness-0 invert"
                />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-none bg-white/10 text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {isLoggedIn && profile && (
                <div className="px-6 py-4 bg-gold/10 border-b border-gold/20">
                  <div className="flex items-center gap-3">
                    <AvatarDisplay avatarUrl={profile.avatar_url} fullName={profile.full_name} />
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm truncate">{profile.full_name}</p>
                      <p className="text-xs text-gray-400 truncate">{profile.email}</p>
                    </div>
                  </div>
                  <span className="mt-2 inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 bg-gold/20 text-gold border border-gold/40">
                    {roleLabel[profile.role] || getRoleLabel(profile.role, lang === 'ar' ? 'ar' : 'en')}
                  </span>
                </div>
              )}

              <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {navLinks.map(({ key, path }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center px-4 py-3 text-xs uppercase tracking-widest font-semibold transition-colors ${
                      isActive(path)
                        ? 'text-gold bg-gold/10 border-l-2 border-gold'
                        : 'text-gray-300 hover:text-gold'
                    }`}
                  >
                    {t(key)}
                  </Link>
                ))}

                {/* Logged-in links below nav */}
                {isLoggedIn && profile && (
                  <>
                    <div className="my-3 border-t border-white/10" />
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest text-white hover:text-gold">
                      <FiUser className="w-4 h-4 text-gold" /> Profile
                    </Link>
                    {canAccessAdmin && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest text-gold font-bold">
                        <FiShield className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    {profile.role === 'investor' && (
                      <Link to="/investor" className="flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest text-white hover:text-gold">
                        <FiBarChart2 className="w-4 h-4 text-gold" /> Investor Dashboard
                      </Link>
                    )}
                  </>
                )}
              </nav>

              <div className="px-5 pb-6 border-t border-white/10 space-y-3 pt-4">

                {/* Login / Register — only when LOGGED OUT */}
                {!isLoggedIn && !loading && (
                  <div className="flex gap-2 mb-2">
                    <Link
                      to="/login"
                      className="btn-outline flex-1 justify-center !py-2.5 !px-2"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="btn-gold flex-1 justify-center !py-2.5 !px-2"
                    >
                      Register
                    </Link>
                  </div>
                )}

                {/* Logout — only when LOGGED IN */}
                {isLoggedIn && (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-xs uppercase tracking-wider font-semibold text-red-400 border border-red-900/40 bg-red-950/20 hover:bg-red-900/40 transition-colors mb-2"
                  >
                    <FiLogOut className="w-4 h-4" /> Logout
                  </button>
                )}

                {/* Utility Row: Lang + Theme */}
                <div className="flex gap-2">
                  <button
                    onClick={toggleLang}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold bg-white/5 border border-white/10 text-white"
                  >
                    <FiGlobe className="w-3.5 h-3.5 text-gold" />
                    <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold bg-white/5 border border-white/10 text-white"
                  >
                    {isDark ? <><FiSun className="w-3.5 h-3.5 text-gold" /> Light</> : <><FiMoon className="w-3.5 h-3.5" /> Dark</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
