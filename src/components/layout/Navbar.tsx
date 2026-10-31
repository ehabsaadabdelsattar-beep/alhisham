import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getRoleLabel } from '../../lib/permissions';
import {
  FiSun, FiMoon, FiUser, FiLogOut, FiSettings,
  FiChevronDown, FiX, FiShield, FiGlobe,
  FiArrowUpRight, FiPhone, FiInstagram, FiLinkedin, FiHome, FiCalendar
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import BrandLogo from '../ui/BrandLogo';
import LuxuryButton from '../ui/LuxuryButton';

gsap.registerPlugin(ScrollTrigger);

const WHATSAPP_NUMBER = '201103657888';

function getInitials(name?: string | null): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');
}

function AvatarDisplay({ avatarUrl, fullName, size = 'md' }: { avatarUrl?: string | null; fullName?: string | null; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={fullName || 'User'}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-gold/50 shadow-md`}
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center font-bold text-forest ring-2 ring-gold/50 shadow-md`}>
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
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaMenu, setMegaMenu] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const menuTlRef = useRef<gsap.core.Timeline | null>(null);

  const { session, profile, loading, signOut, canAccessAdmin } = useAuth();
  const isLoggedIn = !!session;

  const getLenis = () => {
    return (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
  };

  const navLinks = [
    { num: '01', key: 'nav.home', path: '/' },
    { num: '02', key: 'nav.about', path: '/about' },
    { num: '03', key: 'nav.projects', path: '/projects', hasMega: 'projects' },
    { num: '04', key: 'nav.services', path: '/#services', hasMega: 'services' },
    { num: '05', key: 'nav.blog', path: '/blog' },
    { num: '06', key: 'nav.careers', path: '/careers' },
    { num: '07', key: 'nav.contact', path: '/contact' },
  ];

  const featuredResidences = [
    {
      id: 'mansions',
      tag_ar: 'القصور السكنية الملكية',
      tag_en: 'SIGNATURE MANSIONS',
      title_ar: 'قصور الأفق ريزيدنس',
      title_en: 'Horizon Mansions',
      area: '850 m²',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      path: '/projects',
    },
    {
      id: 'penthouses',
      tag_ar: 'أجنحة السحاب البانورامية',
      tag_en: 'SKYLINE PENTHOUSES',
      title_ar: 'بانوراما بنتهاوس دوبلكس',
      title_en: 'Panorama Penthouses',
      area: '620 m²',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      path: '/projects',
    },
    {
      id: 'duplexes',
      tag_ar: 'فلل الحدائق الخاصة',
      tag_en: 'GARDEN DUPLEXES',
      title_ar: 'دوبلكس الحدائق المعلقة',
      title_en: 'Garden Duplexes',
      area: '480 m²',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      path: '/projects',
    },
  ];

  const serviceItems = [
    { icon: '🏗️', title: lang === 'ar' ? 'التطوير العقاري' : 'Real Estate Development', desc: lang === 'ar' ? 'مشاريع سكنية وتجارية فاخرة' : 'Premium residential & commercial projects', path: '/#services' },
    { icon: '📋', title: lang === 'ar' ? 'إدارة المشاريع' : 'Project Management', desc: lang === 'ar' ? 'إشراف متكامل على جميع المراحل' : 'End-to-end project oversight', path: '/#services' },
    { icon: '📈', title: lang === 'ar' ? 'الاستثمار العقاري' : 'Real Estate Investment', desc: lang === 'ar' ? 'فرص استثمارية بعوائد مضمونة' : 'Investment opportunities with guaranteed returns', path: '/#services' },
    { icon: '🏛️', title: lang === 'ar' ? 'الاستشارات الهندسية' : 'Engineering Consultancy', desc: lang === 'ar' ? 'خبراء هندسيون ومعماريون' : 'Expert architects & engineers', path: '/#services' },
  ];

  const projectItems = [
    { title: lang === 'ar' ? 'المشاريع السكنية' : 'Residential Projects', path: '/projects?filter=residential' },
    { title: lang === 'ar' ? 'المشاريع التجارية' : 'Commercial Projects', path: '/projects?filter=commercial' },
    { title: lang === 'ar' ? 'المشاريع المتعددة' : 'Mixed-Use Projects', path: '/projects?filter=mixed' },
    { title: lang === 'ar' ? 'المشاريع قيد التنفيذ' : 'Under Construction', path: '/projects?status=ongoing' },
    { title: lang === 'ar' ? 'المشاريع المنجزة' : 'Completed Projects', path: '/projects?status=completed' },
  ];

  // Smart Hide-on-Scroll Down Detection
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);

      // Always show when near the top of the page
      if (currentScrollY <= 80) {
        setNavVisible(true);
      } else {
        // Hide when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY.current + 8) {
          setNavVisible(false);
        } else if (currentScrollY < lastScrollY.current - 8) {
          setNavVisible(true);
        }
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Master Fullscreen Architectural Menu Timeline
  useEffect(() => {
    const defaultMenuIconHeight = '0.5rem';

    const tl = gsap.timeline({
      paused: true,
      reversed: true,
      onStart: () => {
        const menuWrapper = document.querySelector('.menu-open_wrapper') as HTMLElement | null;
        if (menuWrapper) menuWrapper.style.display = 'block';
      },
      onReverseComplete: () => {
        const menuWrapper = document.querySelector('.menu-open_wrapper') as HTMLElement | null;
        if (menuWrapper) menuWrapper.style.display = 'none';
        setMenuOpen(false);
      },
    });

    menuTlRef.current = tl;

    tl.to('.menu-open-background', {
      height: '100%',
      duration: 0.9,
      ease: 'power3.inOut',
    })
      .fromTo(
        '.open-menu_wrapper',
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power2.out' },
        0.2
      )
      .fromTo(
        '.residence-menu-component',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out', stagger: 0.08 },
        0.3
      )
      .fromTo(
        '.nav-link_wrapper a',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          duration: 0.6,
          ease: 'power2.out',
        },
        0.3
      );

    return () => {
      tl.kill();
    };
  }, [lang]);

  const toggleMenu = () => {
    const tl = menuTlRef.current;
    if (!tl) return;

    if (tl.reversed()) {
      getLenis()?.stop();
      tl.timeScale(1).play();
      setMenuOpen(true);
      document.querySelector('.menu-open-background')?.classList.add('menu-open');
    } else {
      tl.timeScale(2).reverse();
      getLenis()?.start();
      setMenuOpen(false);
      document.querySelector('.menu-open-background')?.classList.remove('menu-open');
    }
  };

  const closeMenuImmediately = () => {
    const tl = menuTlRef.current;
    if (tl && !tl.reversed()) {
      tl.timeScale(2.5).reverse();
      getLenis()?.start();
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    closeMenuImmediately();
    setMegaMenu(null);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaMenu(null);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    closeMenuImmediately();
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
      {/* 
        ============================================================
        MINIMAL & CINEMATIC LUXURY FLOATING NAVBAR
        Transparent & unobstructed over hero, sleek glass when scrolled.
        ============================================================
      */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 select-none transition-all duration-500 ease-out ${
          navVisible || menuOpen
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        } ${
          scrolled
            ? 'bg-[#103C32]/45 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/20 shadow-[0_12px_40px_0_rgba(0,0,0,0.18),inset_0_1px_0_0_rgba(255,255,255,0.25)] py-3 sm:py-3.5'
            : 'bg-white/5 backdrop-blur-md border-b border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] py-4 sm:py-5'
        }`}
      >
        <div className="container-custom relative flex items-center justify-between gap-4">
          
          {/* Brand Logo with Architectural Identity */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group z-10">
            <BrandLogo
              theme="white"
              size={scrolled ? 'sm' : 'md'}
            />
          </Link>

          {/* 
            Right Action Controls (Signature Reference Capsule Pills)
            1. [ ☰ Menu / القائمة ]
            2. [ خطط لزيارتك / Plan your visit ]
            3. [ ⌂ الوحدات المتاحة / Availability ]
          */}
          <div className="flex items-center gap-2.5 sm:gap-3 z-10">
            
            {/* Pill 1: Minimalist Menu Trigger ([ ☰ Menu ]) */}
            <button
              onClick={toggleMenu}
              aria-label="Open Fullscreen Architectural Menu"
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-white/95 hover:bg-white text-forest text-xs font-semibold shadow-md backdrop-blur-md transition-all hover:scale-105 active:scale-95"
            >
              <div className="w-3.5 flex flex-col justify-between items-center h-2">
                <span className="block w-full h-[1.5px] bg-forest rounded-full" />
                <span className="block w-full h-[1.5px] bg-forest rounded-full" />
              </div>
              <span className="font-sans tracking-wider uppercase text-[11px] sm:text-xs">
                {lang === 'ar' ? 'القائمة' : 'Menu'}
              </span>
            </button>

            {/* Pill 2: Plan your visit (CTA) */}
            <Link
              to="/contact"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-medium backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <FiCalendar className="w-3.5 h-3.5 text-gold" />
              <span>{lang === 'ar' ? 'حجز زيارة' : 'Plan your visit'}</span>
            </Link>

            {/* Pill 3: Availability / Residences (Warm Amber/Gold Pill inspired by reference) */}
            <Link
              to="/projects"
              className="hidden md:inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-gold hover:bg-gold-light text-forest text-xs font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <FiHome className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'الوحدات المتاحة' : 'Availability'}</span>
            </Link>

            {/* Auth User Menu for Logged-in Staff/Admins */}
            {isLoggedIn && profile && (
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="Account menu"
                  className="flex items-center gap-1.5 p-0.5 rounded-full border border-white/30 hover:border-gold transition-colors"
                >
                  <AvatarDisplay avatarUrl={profile.avatar_url} fullName={profile.full_name} size="sm" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute end-0 mt-3 w-56 bg-forest-dark border border-white/15 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden backdrop-blur-2xl"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-xs font-bold text-white truncate font-sans">{profile.full_name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{profile.email}</p>
                        <span className="mt-1.5 inline-block text-[9px] uppercase tracking-wider px-2 py-0.5 bg-gold/20 text-gold rounded-full font-bold">
                          {roleLabel[profile.role] || getRoleLabel(profile.role, lang === 'ar' ? 'ar' : 'en')}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-xs text-ivory hover:bg-white/10 hover:text-gold transition-colors"
                        >
                          <FiSettings className="w-4 h-4 text-gold" /> {lang === 'ar' ? 'الإعدادات' : 'Settings'}
                        </Link>
                        {canAccessAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-xs text-gold font-bold hover:bg-white/10 transition-colors"
                          >
                            <FiShield className="w-4 h-4" /> {lang === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-white/10 py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:bg-red-900/20 transition-colors"
                        >
                          <FiLogOut className="w-4 h-4" /> {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Hover Mega Menus */}
        <AnimatePresence>
          {megaMenu === 'projects' && (
            <motion.div
              ref={megaRef}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onMouseLeave={() => setMegaMenu(null)}
              className="absolute top-full left-0 right-0 bg-forest-dark/95 border-b border-white/15 shadow-2xl py-8 px-6 backdrop-blur-2xl"
            >
              <div className="container-custom grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="text-gold text-xs font-semibold uppercase tracking-widest mb-2 font-mono">
                    {lang === 'ar' ? 'المحفظة العقارية' : 'PORTFOLIO'}
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 font-sans">
                    {lang === 'ar' ? 'مشاريع الهشام الاستثنائية' : 'Al Hisham Developments'}
                  </h4>
                  <p className="text-xs text-ivory/70 leading-relaxed font-sans mb-4">
                    {lang === 'ar'
                      ? 'مشاريع معمارية رائدة مصممة بأعلى معايير الجودة العالمية.'
                      : 'Landmark residential and commercial architectural achievements.'}
                  </p>
                  <Link
                    to="/projects"
                    className="text-xs font-bold text-gold hover:underline inline-flex items-center gap-1"
                  >
                    <span>{t('projects.view_all')}</span>
                    <FiArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {projectItems.map((p, i) => (
                    <Link
                      key={i}
                      to={p.path}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-gold hover:bg-white/10 transition-all group"
                    >
                      <span className="text-xs font-bold text-white group-hover:text-gold transition-colors font-sans block">
                        {p.title}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {lang === 'ar' ? 'استكشف المخططات' : 'View Masterplans'} &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {megaMenu === 'services' && (
            <motion.div
              ref={megaRef}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onMouseLeave={() => setMegaMenu(null)}
              className="absolute top-full left-0 right-0 bg-forest-dark/95 border-b border-white/15 shadow-2xl py-8 px-6 backdrop-blur-2xl"
            >
              <div className="container-custom grid grid-cols-1 md:grid-cols-4 gap-6">
                {serviceItems.map((s, i) => (
                  <Link
                    key={i}
                    to={s.path}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-gold hover:bg-white/10 transition-all group"
                  >
                    <span className="text-2xl mb-2 block">{s.icon}</span>
                    <h5 className="text-xs font-bold text-white group-hover:text-gold transition-colors font-sans mb-1">
                      {s.title}
                    </h5>
                    <p className="text-[11px] text-ivory/70 leading-relaxed font-sans">
                      {s.desc}
                    </p>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 
        ============================================================
        FULLSCREEN ARCHITECTURAL LUXURY MENU DRAWER
        ============================================================
      */}
      <div
        className="menu-open_wrapper fixed inset-0 z-[60] overflow-hidden select-none pointer-events-auto"
        style={{ display: 'none' }}
        aria-hidden={!menuOpen}
      >
        {/* Expanding Deep Emerald Curtain Background */}
        <div
          className="menu-open-background absolute top-0 left-0 w-full bg-[#103C32] border-b border-gold/30 overflow-hidden"
          style={{ height: '0%' }}
        >
          <div className="absolute top-0 left-12 w-px h-full bg-gradient-to-b from-transparent via-gold/15 to-transparent pointer-events-none hidden md:block" />
          <div className="absolute top-0 right-12 w-px h-full bg-gradient-to-b from-transparent via-gold/15 to-transparent pointer-events-none hidden md:block" />
        </div>

        {/* Content Wrapper inside Fullscreen Menu */}
        <div className="open-menu_wrapper relative z-20 w-full h-full flex flex-col justify-between p-6 sm:p-12 lg:p-16 overflow-y-auto">
          {/* Top Bar inside Menu */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <Link to="/" onClick={closeMenuImmediately} className="flex items-center gap-3">
              <BrandLogo variant="horizontal" theme="gold" size="md" />
            </Link>

            <div className="flex items-center gap-3">
              {/* Language Switcher inside Menu */}
              <button
                onClick={toggleLang}
                title={lang === 'ar' ? 'Switch to English' : 'التحويل للغة العربية'}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-gold hover:text-forest border border-white/20 text-white text-xs font-semibold tracking-wider transition-all"
              >
                <FiGlobe className="w-3.5 h-3.5 text-gold" />
                <span>{lang === 'ar' ? 'English (EN)' : 'العربية (AR)'}</span>
              </button>

              {/* Close Trigger Button */}
              <button
                onClick={toggleMenu}
                className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 hover:bg-gold hover:text-forest border border-white/20 text-white transition-all shadow-lg"
                aria-label="Close menu"
              >
                <span className="text-xs font-mono uppercase tracking-[0.2em] font-bold">
                  {lang === 'ar' ? 'إغلاق' : 'CLOSE'}
                </span>
                <FiX className="w-4 h-4 transition-transform group-hover:rotate-90" />
              </button>
            </div>
          </div>

          {/* Main Grid: Left Column Featured Residences & Right Column Navigation */}
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center my-auto py-8">
            
            {/* Left Column: Featured Residences Preview (5 cols) */}
            <div className="lg:col-span-5 hidden lg:block space-y-6">
              <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-widest font-mono">
                <span className="w-2 h-2 rounded-full bg-gold" />
                <span>{lang === 'ar' ? 'المشاريع الاستثنائية الحصرية' : 'BESPOKE RESIDENCES'}</span>
              </div>

              {/* 3 Interactive Residence Cards */}
              <div className="residence-menu-component space-y-3.5">
                {featuredResidences.map((res) => (
                  <Link
                    key={res.id}
                    to={res.path}
                    onClick={closeMenuImmediately}
                    className="group relative block p-3.5 rounded-2xl bg-black/25 hover:bg-black/40 border border-white/10 hover:border-gold/50 transition-all overflow-hidden"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/15">
                        <img
                          src={res.image}
                          alt={lang === 'ar' ? res.title_ar : res.title_en}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-gold block">
                          {lang === 'ar' ? res.tag_ar : res.tag_en}
                        </span>
                        <h4 className="text-sm font-bold text-white group-hover:text-gold transition-colors font-sans truncate mt-0.5">
                          {lang === 'ar' ? res.title_ar : res.title_en}
                        </h4>
                        <span className="text-[11px] text-gray-300 font-mono mt-0.5 block">
                          {res.area} &bull; {lang === 'ar' ? 'تسليم فوري' : 'Ready Handover'}
                        </span>
                      </div>
                      <FiArrowUpRight className="w-4 h-4 text-gold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Column: Editorial Navigation Links (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <span className="text-gold text-xs font-semibold uppercase tracking-[0.25em] block mb-2 font-mono">
                  {lang === 'ar' ? 'القائمة الرئيسية' : 'NAVIGATION'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white font-sans">
                  {lang === 'ar' ? 'الهشام للتطوير العقاري' : 'AL HISHAM DEVELOPMENTS'}
                </h3>
              </div>

              {/* Navigation Links Grid */}
              <div className="nav-link_wrapper grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 pt-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={closeMenuImmediately}
                    className="group flex items-baseline gap-4 py-2 border-b border-white/10 hover:border-gold/50 transition-all"
                  >
                    <span className="text-xs font-mono text-gold opacity-60 group-hover:opacity-100 transition-opacity">
                      {link.num}
                    </span>
                    <span className="text-lg sm:text-xl font-medium font-sans text-white group-hover:text-gold group-hover:translate-x-2 rtl:group-hover:-translate-x-2 transition-all">
                      {t(link.key)}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Social Channels & Secondary VIP Button */}
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-3 text-gray-300">
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-gold hover:text-forest flex items-center justify-center border border-white/15 transition-all text-emerald-300 hover:text-forest"
                    aria-label="WhatsApp"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-gold hover:text-forest flex items-center justify-center border border-white/15 transition-all"
                    aria-label="Instagram"
                  >
                    <FiInstagram className="w-4 h-4" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-gold hover:text-forest flex items-center justify-center border border-white/15 transition-all"
                    aria-label="LinkedIn"
                  >
                    <FiLinkedin className="w-4 h-4" />
                  </a>
                  <a
                    href="tel:+201103657888"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-gold hover:text-forest flex items-center justify-center border border-white/15 transition-all"
                    aria-label="Phone"
                  >
                    <FiPhone className="w-4 h-4" />
                  </a>
                </div>

                <LuxuryButton
                  to="/contact"
                  onClick={closeMenuImmediately}
                  variant="gold"
                  text={lang === 'ar' ? 'حجز موعد استشارة VIP' : 'Book VIP Private Tour'}
                  icon={<FiArrowUpRight className="w-4 h-4" />}
                  className="!px-7 !py-3 !rounded-full text-xs font-bold uppercase tracking-wider shadow-xl"
                />
              </div>
            </div>

          </div>

          {/* Bottom Bar inside Menu */}
          <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400 font-mono">
            <span>&copy; {new Date().getFullYear()} AL HISHAM DEVELOPMENTS. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <Link to="/privacy" onClick={closeMenuImmediately} className="hover:text-gold transition-colors">
                {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </Link>
              <Link to="/terms" onClick={closeMenuImmediately} className="hover:text-gold transition-colors">
                {lang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
