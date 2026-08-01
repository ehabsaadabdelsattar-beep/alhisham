import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { financeService } from '../../services/finance';
import type { Transaction } from '../../services/finance';
import { projectsService } from '../../services/projects';
import type { Project } from '../../services/projects';
import {
  FiDollarSign, FiFilter, FiDownload, FiPlus, FiSearch,
  FiEdit3, FiCheckCircle, FiXCircle, FiClock, FiRefreshCw,
  FiX
} from 'react-icons/fi';

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  pending: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  failed: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
  refunded: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30',
};

const TYPE_LABELS: Record<string, string> = {
  investment: 'استثمار',
  payment: 'دفعة',
  refund: 'استرداد',
  other: 'أخرى'
};

export default function AdminTransactions() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Transaction>>({
    amount: 0,
    currency: 'EGP',
    type: 'payment',
    status: 'completed',
    payment_method: 'bank_transfer',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  const [projectsList, setProjectsList] = useState<Project[]>([]);

  // Load Initial Options
  useEffect(() => {
    if (isAdmin) {
      projectsService.getProjects().then(setProjectsList);
    }
  }, [isAdmin]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { data, count } = await financeService.getTransactions({
        page, limit, status: filterStatus, type: filterType, search
      });
      setTransactions(data);
      setTotalCount(count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadTransactions();
  }, [page, filterStatus, filterType, isAdmin]);

  // Realtime
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase.channel('tx_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        loadTransactions();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin, page, filterStatus, filterType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount! <= 0) return alert('المبلغ يجب أن يكون أكبر من 0');
    
    setFormSubmitting(true);
    try {
      if (editingId) {
        await financeService.updateTransaction(editingId, formData);
      } else {
        await financeService.createTransaction(formData);
      }
      setShowForm(false);
      setFormData({ amount: 0, currency: 'EGP', type: 'payment', status: 'completed', payment_method: 'bank_transfer', transaction_date: new Date().toISOString().split('T')[0] });
      setEditingId(null);
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleExport = () => {
    // Export only what's loaded, or fetch all if needed. For now, export loaded table data.
    const exportData = transactions.map(t => ({
      ID: t.id,
      Amount: t.amount,
      Currency: t.currency,
      Type: TYPE_LABELS[t.type] || t.type,
      Status: t.status,
      Project: t.projects?.title_ar || '',
      Customer: t.profiles?.full_name || '',
      Date: new Date(t.transaction_date).toLocaleDateString('ar-EG'),
      Method: t.payment_method
    }));
    financeService.downloadCSV(exportData, 'Transactions');
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center" dir="rtl">
        <FiXCircle className="w-16 h-16 text-red-500 mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-dark dark:text-white mb-2">غير مصرح لك</h2>
        <p className="text-gray-500">هذه الصفحة متاحة فقط لمديري النظام.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white flex items-center gap-2">
            <FiDollarSign className="text-gold" />
            إدارة المعاملات المالية
          </h1>
          <p className="text-sm text-gray-500 mt-1">إجمالي الحركات المفلترة: {totalCount}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 transition-colors border border-gray-200 dark:border-gray-700">
            <FiDownload /> تصدير CSV
          </button>
          <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ amount: 0, currency: 'EGP', type: 'payment', status: 'completed', payment_method: 'bank_transfer', transaction_date: new Date().toISOString().split('T')[0] }); }} className="flex items-center gap-2 px-4 py-2 bg-gold text-dark font-bold rounded-lg text-sm hover:bg-gold/90 transition-colors shadow-sm">
            <FiPlus /> معاملة جديدة
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-light border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="flex-1 relative">
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث (جاري العمل على الربط الكامل)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-gold"
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="py-2 px-4 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-gold">
          <option value="">جميع الحالات</option>
          <option value="completed">مكتملة</option>
          <option value="pending">معلقة</option>
          <option value="refunded">مستردة</option>
          <option value="failed">مرفوضة</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="py-2 px-4 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-gold">
          <option value="">جميع الأنواع</option>
          <option value="payment">دفعة (Payment)</option>
          <option value="investment">استثمار (Investment)</option>
          <option value="refund">استرداد (Refund)</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-dark-light border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <FiDollarSign className="w-12 h-12 mb-3 opacity-20" />
            <p>لا توجد معاملات مالية تطابق بحثك.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 dark:bg-dark/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="p-4 font-semibold">المبلغ</th>
                  <th className="p-4 font-semibold">العميل</th>
                  <th className="p-4 font-semibold">المشروع</th>
                  <th className="p-4 font-semibold">النوع</th>
                  <th className="p-4 font-semibold">الحالة</th>
                  <th className="p-4 font-semibold">التاريخ</th>
                  <th className="p-4 font-semibold">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-dark/50 transition-colors">
                    <td className="p-4 font-bold text-dark dark:text-white" dir="ltr">
                      {t.currency} {t.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{t.profiles?.full_name || '—'}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{t.projects?.title_ar || '—'}</td>
                    <td className="p-4">
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {TYPE_LABELS[t.type] || t.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[t.status] || ''}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(t.transaction_date).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="p-4">
                      <button onClick={() => { setFormData(t); setEditingId(t.id); setShowForm(true); }} className="p-2 text-gold hover:bg-gold/10 rounded-lg transition-colors">
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalCount > limit && (
        <div className="flex justify-between items-center text-sm text-gray-500">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-dark">السابق</button>
          <span>صفحة {page} من {Math.ceil(totalCount / limit)}</span>
          <button disabled={page >= Math.ceil(totalCount / limit)} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-dark">التالي</button>
        </div>
      )}

      {/* Transaction Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-dark-light rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl w-full max-w-xl overflow-hidden" dir="rtl">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold text-dark dark:text-white">
                  {editingId ? 'تعديل المعاملة' : 'إضافة معاملة مالية جديدة'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">المبلغ (Amount) *</label>
                    <input type="number" required min="1" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} className="w-full px-4 py-2 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">العملة (Currency) *</label>
                    <input type="text" required value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value.toUpperCase() })} className="w-full px-4 py-2 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-gold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">النوع (Type) *</label>
                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as Transaction['type'] })} className="w-full px-4 py-2 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-gold">
                      <option value="payment">دفعة (Payment)</option>
                      <option value="investment">استثمار (Investment)</option>
                      <option value="refund">استرداد (Refund)</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">الحالة (Status) *</label>
                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as Transaction['status'] })} className="w-full px-4 py-2 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-gold">
                      <option value="completed">مكتملة (Completed)</option>
                      <option value="pending">معلقة (Pending)</option>
                      <option value="failed">مرفوضة (Failed)</option>
                      <option value="refunded">مستردة (Refunded)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">المشروع (Project)</label>
                    <select value={formData.project_id || ''} onChange={e => setFormData({ ...formData, project_id: e.target.value || null })} className="w-full px-4 py-2 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-gold">
                      <option value="">-- بدون ارتباط --</option>
                      {projectsList.map(p => <option key={p.id} value={p.id}>{p.title_ar}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">طريقة الدفع</label>
                    <input type="text" value={formData.payment_method || ''} onChange={e => setFormData({ ...formData, payment_method: e.target.value })} placeholder="مثال: تحويل بنكي" className="w-full px-4 py-2 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-gold" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">تاريخ المعاملة (Date)</label>
                  <input type="date" required value={formData.transaction_date ? String(formData.transaction_date).split('T')[0] : ''} onChange={e => setFormData({ ...formData, transaction_date: e.target.value })} className="w-full px-4 py-2 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-gold" />
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors font-medium">إلغاء</button>
                  <button type="submit" disabled={formSubmitting} className="px-6 py-2 rounded-xl bg-gold text-dark font-bold hover:bg-gold/90 transition-colors disabled:opacity-50">
                    {formSubmitting ? 'جاري الحفظ...' : 'حفظ المعاملة'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
