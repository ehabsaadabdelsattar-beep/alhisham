import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRoleLabel } from '../../lib/permissions';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../../components/ui/SEO';
import BrandLogo from '../../components/ui/BrandLogo';
import {
  FiHome, FiBox, FiFileText, FiImage, FiUsers,
  FiInbox, FiSettings, FiLogOut, FiActivity,
  FiExternalLink, FiMenu, FiX, FiGlobe, FiDollarSign, FiCreditCard, FiTarget,
  FiShield, FiKey
} from 'react-icons/fi';

type NavItem = {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  permission?: string;
  adminOnly?: boolean;
};

const baseNavItems: NavItem[] = [
  { name: 'الرئيسية', path: '/admin', icon: FiHome, exact: true, permission: 'analytics.view' },
  { name: 'المشاريع', path: '/admin/projects', icon: FiBox, permission: 'projects.view' },
  { name: 'المقالات', path: '/admin/articles', icon: FiFileText, permission: 'content.view' },
  { name: 'مكتبة الوسائط', path: '/admin/media', icon: FiImage, permission: 'projects.manage_images' },
  { name: 'المستخدمون', path: '/admin/users', icon: FiUsers, permission: 'users.view' },
  { name: 'الأدوار', path: '/admin/roles', icon: FiShield, permission: 'users.manage_permissions' },
  { name: 'الصلاحيات', path: '/admin/permissions', icon: FiKey, permission: 'users.manage_permissions' },
  { name: 'الطلبات', path: '/admin/requests', icon: FiInbox, permission: 'crm.view' },
  { name: 'إدارة العملاء (CRM)', path: '/admin/crm', icon: FiTarget, permission: 'crm.view' },
  { name: 'المعاملات المالية', path: '/admin/transactions', icon: FiDollarSign, permission: 'finance.view' },
  { name: 'المصروفات', path: '/admin/expenses', icon: FiCreditCard, permission: 'finance.view' },
  { name: 'سجل النشاطات', path: '/admin/logs', icon: FiActivity, permission: 'audit.view' },
  { name: 'الإعدادات', path: '/admin/settings', icon: FiSettings, permission: 'settings.view' },
];

function getInitials(name: string | null): string {
  if (!name) return 'A';
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
}

interface SidebarContentProps {
  profile: { avatar_url?: string | null; full_name?: string | null; email?: string | null; role?: string } | null;
  navItems: NavItem[];
  isActive: (path: string, exact?: boolean) => boolean;
  onClose: () => void;
  onLogout: () => void;
}

function SidebarContent({ profile, navItems, isActive, onClose, onLogout }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full bg-emerald-dark text-ivory">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-20 px-5 border-b border-white/10 flex-shrink-0">
        <Link to="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group">
          <BrandLogo theme="white" size="sm" />
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 hover:text-white hover:bg-white/10"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* User Profile Card */}
      <div className="px-5 py-5 border-b border-white/10 bg-forest/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/90 to-yellow-600 flex items-center justify-center text-forest font-bold text-sm flex-shrink-0 shadow-md">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || ''} className="w-full h-full rounded-xl object-cover" />
            ) : (
              getInitials(profile?.full_name || null)
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate font-sans">{profile?.full_name || 'Admin User'}</p>
            <p className="text-xs text-textSecondary dark:text-gray-400 truncate font-sans">{profile?.email}</p>
          </div>
        </div>
        <span className="mt-2.5 inline-block px-2.5 py-0.5 rounded-lg text-[11px] bg-emerald/60 text-gold border border-gold/30 font-semibold font-sans">
          {getRoleLabel(profile?.role || '', 'ar')}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
        {navItems.map(item => {
          const active = isActive(item.path, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-sans transition-all ${
                active
                  ? 'bg-emerald text-white border border-gold/40 shadow-sm font-semibold'
                  : 'text-ivory/75 hover:text-white hover:bg-emerald/30'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-gold' : 'text-ivory/60'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div className="px-3.5 py-4 border-t border-white/10 space-y-1.5 flex-shrink-0 bg-forest-dark/40">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-ivory/75 hover:text-white hover:bg-white/5 transition-all font-sans"
        >
          <FiGlobe className="w-4 h-4 text-gold flex-shrink-0" />
          <span>عرض الموقع</span>
          <FiExternalLink className="w-3.5 h-3.5 mr-auto opacity-50" />
        </a>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-all font-sans"
        >
          <FiLogOut className="w-4 h-4 flex-shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { signOut, profile, hasPermission } = useAuth();
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
    if (profile?.role === 'admin') return true;
    if (item.adminOnly) return false;
    if (item.permission) return hasPermission(item.permission);
    if (profile?.role === 'editor') {
      return ['/admin', '/admin/projects', '/admin/articles', '/admin/media', '/admin/requests', '/admin/crm'].includes(item.path);
    }
    return false;
  });

  return (
    <>
      <SEO
        title="لوحة التحكم"
        description="Admin Dashboard - AL HISHAM DEVELOPMENTS"
        noindex
      />

      <div className="flex h-screen bg-ivory dark:bg-forest-dark overflow-hidden font-sans" dir="rtl">
        {/* Mobile Backdrop */}
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

        {/* Desktop Sidebar (Deep Emerald) */}
        <aside className="hidden lg:flex w-64 bg-emerald-dark border-l border-white/10 flex-col flex-shrink-0 shadow-xl">
          <SidebarContent
            profile={profile}
            navItems={navItems}
            isActive={isActive}
            onClose={() => setSidebarOpen(false)}
            onLogout={handleLogout}
          />
        </aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-emerald-dark border-l border-white/10 flex flex-col lg:hidden shadow-2xl"
            >
              <SidebarContent
                profile={profile}
                navItems={navItems}
                isActive={isActive}
                onClose={() => setSidebarOpen(false)}
                onLogout={handleLogout}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Workspace: Top Header & Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 bg-white dark:bg-forest border-b border-beige/60 dark:border-white/10 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-beige/30 dark:bg-forest-dark text-forest dark:text-ivory"
                aria-label="Open sidebar"
              >
                <FiMenu className="w-5 h-5" />
              </button>
              <div className="text-sm font-semibold text-forest dark:text-ivory hidden sm:block">
                {navItems.find(n => isActive(n.path, n.exact))?.name || 'لوحة التحكم'}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-ivory dark:bg-forest-dark text-forest dark:text-ivory hover:bg-beige/50 border border-beige/60 dark:border-white/10 transition-colors"
              >
                <FiGlobe className="w-3.5 h-3.5 text-gold" />
                <span className="hidden sm:inline">عرض الموقع</span>
                <FiExternalLink className="w-3 h-3 opacity-60" />
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/30 transition-colors"
              >
                <FiLogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          </header>

          {/* Main Content Workspace (Warm Ivory `#F4F1EA`) */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-ivory dark:bg-forest-dark">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
