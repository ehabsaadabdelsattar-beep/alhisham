import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import {
  FiBox, FiUsers, FiFileText, FiMessageSquare, FiTrendingUp,
  FiCheckCircle, FiClock, FiTool, FiExternalLink, FiPlus,
  FiActivity, FiEye
} from 'react-icons/fi';

interface Stats {
  totalProjects: number;
  publishedProjects: number;
  upcomingProjects: number;
  underConstruction: number;
  completedProjects: number;
  totalUsers: number;
  totalInvestors: number;
  unreadMessages: number;
}

interface RecentProject {
  id: string;
  title_ar: string;
  title_en: string;
  status: string;
  published: boolean;
  cover_image?: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  under_construction: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  sold_out: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  planning: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const statusLabels: Record<string, string> = {
  completed: 'مكتمل',
  under_construction: 'قيد التنفيذ',
  upcoming: 'قريباً',
  sold_out: 'مباع',
  planning: 'تخطيط',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0, publishedProjects: 0, upcomingProjects: 0,
    underConstruction: 0, completedProjects: 0, totalUsers: 0,
    totalInvestors: 0, unreadMessages: 0,
  });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [
        totalP, publishedP, upcomingP, constructionP, completedP,
        usersR, investorsR, messagesR, recentR
      ] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('published', true),
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'upcoming'),
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'under_construction'),
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'investor'),
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'unread'),
        supabase.from('projects').select('id, title_ar, title_en, status, published, cover_image, created_at')
          .order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        totalProjects: totalP.count || 0,
        publishedProjects: publishedP.count || 0,
        upcomingProjects: upcomingP.count || 0,
        underConstruction: constructionP.count || 0,
        completedProjects: completedP.count || 0,
        totalUsers: usersR.count || 0,
        totalInvestors: investorsR.count || 0,
        unreadMessages: messagesR.count || 0,
      });
      setRecentProjects((recentR.data as RecentProject[]) || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'إجمالي المشاريع', value: stats.totalProjects, icon: FiBox, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10' },
    { label: 'مشاريع منشورة', value: stats.publishedProjects, icon: FiEye, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
    { label: 'قيد التنفيذ', value: stats.underConstruction, icon: FiTool, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10' },
    { label: 'مشاريع مكتملة', value: stats.completedProjects, icon: FiCheckCircle, color: 'from-teal-500 to-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/10' },
    { label: 'قريباً', value: stats.upcomingProjects, icon: FiClock, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/10' },
    { label: 'إجمالي المستخدمين', value: stats.totalUsers, icon: FiUsers, color: 'from-pink-500 to-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/10' },
    { label: 'المستثمرون', value: stats.totalInvestors, icon: FiTrendingUp, color: 'from-gold/80 to-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/10' },
    { label: 'رسائل جديدة', value: stats.unreadMessages, icon: FiMessageSquare, color: 'from-red-500 to-red-600', bg: 'bg-red-50 dark:bg-red-900/10' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-white dark:bg-dark-light rounded-xl animate-pulse border border-gray-100 dark:border-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">لوحة التحكم</h1>
          <p className="text-sm text-gray-500 mt-1">مرحباً بك في لوحة إدارة هشام للتطوير العقاري</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/projects"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-dark-400 transition-colors"
          >
            <FiExternalLink className="w-4 h-4" />
            عرض المشاريع
          </Link>
          <Link
            to="/admin/projects/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-dark text-sm font-semibold hover:bg-yellow-500 transition-colors shadow-sm"
          >
            <FiPlus className="w-4 h-4" />
            مشروع جديد
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-dark-light rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 bg-gradient-to-br ${card.color} bg-clip-text`} style={{ color: '#c9a050' }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-dark dark:text-white tabular-nums">{card.value.toLocaleString('ar-EG')}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="bg-white dark:bg-dark-light rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <FiActivity className="w-4 h-4 text-gold" />
            <h2 className="font-semibold text-dark dark:text-white text-sm">آخر المشاريع المضافة</h2>
          </div>
          <Link to="/admin/projects" className="text-xs text-gold hover:underline">
            عرض الكل
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            لا توجد مشاريع بعد.{' '}
            <Link to="/admin/projects/new" className="text-gold hover:underline">أضف أول مشروع</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {recentProjects.map((project) => (
              <div key={project.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-dark-300">
                  {project.cover_image ? (
                    <img src={project.cover_image} alt={project.title_ar} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <FiBox className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark dark:text-white text-sm truncate">{project.title_ar}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{project.title_en}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status] || 'bg-gray-100 text-gray-600'}`}>
                    {statusLabels[project.status] || project.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${project.published ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                    {project.published ? 'منشور' : 'مسودة'}
                  </span>
                  <Link
                    to={`/admin/projects/edit/${project.id}`}
                    className="px-3 py-1 text-xs rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                  >
                    تعديل
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'إضافة مشروع', icon: FiPlus, to: '/admin/projects/new', color: 'text-gold border-gold/30 hover:bg-gold/5' },
          { label: 'إدارة المشاريع', icon: FiBox, to: '/admin/projects', color: 'text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/10' },
          { label: 'عرض الموقع', icon: FiEye, to: '/', color: 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/10' },
          { label: 'صفحة المشاريع', icon: FiExternalLink, to: '/projects', color: 'text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/10' },
        ].map(action => (
          <Link
            key={action.label}
            to={action.to}
            target={action.to.startsWith('/admin') ? undefined : '_blank'}
            rel={action.to.startsWith('/admin') ? undefined : 'noopener noreferrer'}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border bg-white dark:bg-dark-light text-sm font-medium transition-all ${action.color}`}
          >
            <action.icon className="w-5 h-5" />
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
