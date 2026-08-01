import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../../components/ui/SEO';
import {
  FiHome, FiBox, FiFileText, FiImage, FiUsers,
  FiMessageSquare, FiInbox, FiSettings, FiLogOut, FiActivity,
  FiExternalLink, FiMenu, FiX, FiGlobe, FiDollarSign, FiCreditCard
} from 'react-icons/fi';

const baseNavItems = [
  { name: 'الرئيسية', path: '/admin', icon: FiHome, exact: true },
  { name: 'المشاريع', path: '/admin/projects', icon: FiBox },
  { name: 'المقالات', path: '/admin/articles', icon: FiFileText },
  { name: 'مكتبة الوسائط', path: '/admin/media', icon: FiImage },
  { name: 'المستخدمون', path: '/admin/users', icon: FiUsers },
  { name: 'الطلبات', path: '/admin/requests', icon: FiInbox },
  { name: 'المعاملات المالية', path: '/admin/transactions', icon: FiDollarSign, adminOnly: true },
  { name: 'المصروفات', path: '/admin/expenses', icon: FiCreditCard, adminOnly: true },
  { name: 'سجل النشاطات', path: '/admin/logs', icon: FiActivity, adminOnly: true },
  { name: 'الإعدادات', path: '/admin/settings', icon: FiSettings, adminOnly: true },
];

function getInitials(name: string | null): string {
  if (!name) return 'A';
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
}

export default function AdminLayout() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string, exact = false) =>
    exact ? location.pathname === path : (location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path)));

  const navItems = baseNavItems.filter(item => {
    if (item.adminOnly && profile?.role !== 'admin') return false;
    return true;
  });

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-gray-800/50 flex-shrink-0">
        <Link to="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="AL HISHAM" className="h-8 w-auto object-contain brightness-0 invert" />
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-white"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      {/* Profile */}
      <div className="px-4 py-4 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/80 to-yellow-600 flex items-center justify-center text-dark font-bold text-sm flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || ''} className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(profile?.full_name || null)
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{profile?.full_name || 'Admin User'}</p>
            <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
          </div>
        </div>
        <span className="mt-2 inline-block px-2 py-0.5 rounded-full text-xs bg-gold/20 text-gold border border-gold/30">
          {profile?.role === 'admin' ? 'مدير النظام' : profile?.role === 'editor' ? 'محرر' : profile?.role}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(item => {
          const active = isActive(item.path, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-gold/15 text-gold border border-gold/20 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-gold' : ''}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-4 border-t border-gray-800/50 space-y-1 flex-shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <FiGlobe className="w-4 h-4 flex-shrink-0" />
          عرض الموقع
          <FiExternalLink className="w-3 h-3 mr-auto opacity-50" />
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <FiLogOut className="w-4 h-4 flex-shrink-0" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );

  return (
    <>
      <SEO
        title="لوحة التحكم"
        description="Admin Dashboard - AL HISHAM DEVELOPMENT"
        noindex
      />

      <div className="flex h-screen bg-gray-50 dark:bg-[#111] overflow-hidden" dir="rtl">

        {/* Mobile Sidebar Backdrop */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-60 bg-[#0f0f0f] border-l border-gray-800/50 flex-col flex-shrink-0">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-64 bg-[#0f0f0f] border-l border-gray-800/50 flex flex-col lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Top bar */}
          <header className="h-16 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-dark-300 text-gray-600 dark:text-gray-400"
              >
                <FiMenu className="w-5 h-5" />
              </button>
              <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                {navItems.find(n => isActive(n.path, n.exact))?.name || 'لوحة التحكم'}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-dark-300 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-colors"
              >
                <FiGlobe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">عرض الموقع</span>
                <FiExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/30 transition-colors"
              >
                <FiLogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
