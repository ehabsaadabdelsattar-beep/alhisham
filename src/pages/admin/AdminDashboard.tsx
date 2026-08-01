import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { dashboardService } from '../../services/dashboard';
import type { DashboardKPIs } from '../../services/dashboard';
import { projectsService } from '../../services/projects';
import type { Project } from '../../services/projects';
import {
  FiActivity, FiTrendingUp, FiTrendingDown, FiBox, FiUsers,
  FiMessageSquare, FiDollarSign, FiPieChart, FiCalendar,
  FiArrowUpRight, FiEye, FiClock, FiCheckCircle, FiTool,
  FiAlertCircle
} from 'react-icons/fi';

// ─────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, trend, trendValue, prefix = '' }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-light rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group"
    >
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-10 ${color} group-hover:opacity-20 transition-opacity`} />
      
      <div className="flex items-start justify-between mb-4 relative">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-10 dark:bg-opacity-20`}>
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${trend === 'up' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-red-50 text-red-600 dark:bg-red-900/30'}`}>
            {trend === 'up' ? <FiTrendingUp /> : <FiTrendingDown />}
            {trendValue}%
          </div>
        )}
      </div>
      
      <div className="relative">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-dark dark:text-white tabular-nums">
          {prefix}{typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  // State
  const [dateRange, setDateRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Calculate Dates
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    if (dateRange === 'today') start.setHours(0, 0, 0, 0);
    else if (dateRange === '7days') start.setDate(start.getDate() - 7);
    else if (dateRange === '30days') start.setDate(start.getDate() - 30);
    else if (dateRange === 'this_year') start.setMonth(0, 1);
    
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }, [dateRange]);

  // Fetch Data
  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      setLoading(true);
      try {
        const [kpiData, projectsData, activityData, txData] = await Promise.all([
          dashboardService.getKPIs(startDate, endDate),
          projectsService.getProjects(),
          isAdmin ? dashboardService.getRecentActivity() : Promise.resolve([]),
          isAdmin ? dashboardService.getTransactions() : Promise.resolve([]),
        ]);
        
        if (mounted) {
          setKpis(kpiData);
          setRecentProjects(projectsData.slice(0, 5));
          setActivities(activityData);
          setTransactions(txData);
        }
      } catch (err) {
        console.error('Dashboard Load Error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    loadData();
    return () => { mounted = false; };
  }, [startDate, endDate, isAdmin]);

  // Realtime Subscriptions
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase.channel('dashboard_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inquiries' }, () => {
        setKpis(prev => prev ? { ...prev, total_leads: prev.total_leads + 1, new_leads: prev.new_leads + 1 } : null);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'page_views' }, () => {
        setKpis(prev => prev ? { ...prev, total_views: prev.total_views + 1 } : null);
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  return (
    <div className="space-y-8" dir="rtl">
      
      {/* ═══ Header & Filters ═══ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-light p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white flex items-center gap-2">
            <FiPieChart className="text-gold" />
            مركز التحكم الموحد
          </h1>
          <p className="text-sm text-gray-500 mt-1">Company Control Center — {profile?.full_name}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <FiCalendar className="text-gray-400 w-4 h-4" />
          <select 
            value={dateRange} 
            onChange={e => setDateRange(e.target.value)}
            className="bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-2 px-4 text-sm font-medium focus:outline-none focus:border-gold"
          >
            <option value="today">اليوم</option>
            <option value="7days">آخر 7 أيام</option>
            <option value="30days">آخر 30 يوم</option>
            <option value="this_year">هذا العام</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
        </div>
      ) : !kpis ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl">خطأ في تحميل البيانات.</div>
      ) : (
        <>
          {/* ═══ Executive KPIs ═══ */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <StatCard label="إجمالي المشاريع" value={kpis.total_projects} icon={FiBox} color="bg-blue-500" />
            <StatCard label="مشاريع نشطة" value={kpis.active_projects} icon={FiTool} color="bg-amber-500" />
            <StatCard label="إجمالي العملاء" value={kpis.total_customers} icon={FiUsers} color="bg-purple-500" />
            <StatCard label="الطلبات (Leads)" value={kpis.total_leads} icon={FiMessageSquare} color="bg-pink-500" />
            <StatCard label="مشاهدات الموقع" value={kpis.total_views} icon={FiEye} color="bg-emerald-500" trend="up" trendValue={12} />
          </div>

          {/* ═══ Financial Overview (Admin Only) ═══ */}
          {isAdmin && (
            <div className="bg-white dark:bg-dark-light rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <FiDollarSign className="w-5 h-5 text-gold" />
                <h2 className="text-lg font-bold text-dark dark:text-white">اللوحة المالية (Financial Overview)</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-xl bg-gray-50 dark:bg-dark border border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-500 mb-1">الإيرادات (Revenue)</p>
                  <p className="text-2xl font-bold text-emerald-600">EGP {kpis.total_revenue.toLocaleString('ar-EG')}</p>
                </div>
                <div className="p-5 rounded-xl bg-gray-50 dark:bg-dark border border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-500 mb-1">المصروفات (Expenses)</p>
                  <p className="text-2xl font-bold text-red-600">EGP {kpis.total_expenses.toLocaleString('ar-EG')}</p>
                </div>
                <div className="p-5 rounded-xl bg-gray-50 dark:bg-dark border border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-500 mb-1">صافي الربح (Net Profit)</p>
                  <p className={`text-2xl font-bold ${kpis.net_profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    EGP {kpis.net_profit.toLocaleString('ar-EG')}
                  </p>
                </div>
              </div>

              {transactions.length === 0 && (
                <div className="mt-6 flex flex-col items-center justify-center py-8 bg-gray-50 dark:bg-dark/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <FiAlertCircle className="w-8 h-8 text-gray-400 mb-3" />
                  <p className="text-gray-500 font-medium">لا توجد معاملات مالية مسجلة بعد.</p>
                  <p className="text-sm text-gray-400 mt-1">Setup Required: ابدأ بإضافة الـ Transactions لتفعيل الحسابات.</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ Data Grids ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Projects Overview */}
            <div className="bg-white dark:bg-dark-light rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h2 className="font-bold text-dark dark:text-white flex items-center gap-2">
                  <FiBox className="text-gold" />
                  أداء المشاريع
                </h2>
                <Link to="/admin/projects" className="text-xs text-gold hover:underline">عرض الكل</Link>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {recentProjects.map(p => (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-dark-300 overflow-hidden">
                        {p.cover_image && <img src={p.cover_image} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-dark dark:text-white">{p.title_ar}</p>
                        <p className="text-xs text-gray-500">{p.status}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-gold">{p.progress}%</p>
                      <p className="text-[10px] text-gray-400">إنجاز</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity (Audit Log) - Admin Only */}
            {isAdmin && (
              <div className="bg-white dark:bg-dark-light rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="font-bold text-dark dark:text-white flex items-center gap-2">
                    <FiActivity className="text-gold" />
                    سجل النشاطات (Audit Log)
                  </h2>
                </div>
                <div className="p-2">
                  {activities.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">لا توجد نشاطات مسجلة مؤخراً.</div>
                  ) : (
                    <div className="space-y-1">
                      {activities.map(act => (
                        <div key={act.id} className="p-3 hover:bg-gray-50 dark:hover:bg-dark rounded-lg flex gap-3 text-sm transition-colors">
                          <div className="w-2 h-2 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="text-dark dark:text-gray-200">
                              <span className="font-semibold text-gold">{act.profiles?.full_name || 'System'}</span>{' '}
                              {act.action} <span className="text-gray-500">على</span> {act.entity}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(act.created_at).toLocaleString('ar-EG')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </>
      )}
    </div>
  );
}
