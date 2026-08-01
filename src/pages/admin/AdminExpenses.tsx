import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { financeService, Expense } from '../../services/finance';
import {
  FiCreditCard, FiFilter, FiDownload, FiPlus, FiSearch,
  FiEdit3, FiXCircle, FiX
} from 'react-icons/fi';

const CATEGORY_LABELS: Record<string, string> = {
  marketing: 'تسويق',
  operations: 'تشغيل',
  construction: 'إنشاءات',
  administration: 'إدارة',
  other: 'أخرى'
};

export default function AdminExpenses() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  // State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [filterCategory, setFilterCategory] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Expense>>({
    amount: 0,
    currency: 'EGP',
    category: 'operations',
    description: '',
    expense_date: new Date().toISOString().split('T')[0]
  });

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const { data, count } = await financeService.getExpenses({
        page, limit, category: filterCategory
      });
      setExpenses(data);
      setTotalCount(count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadExpenses();
  }, [page, filterCategory, isAdmin]);

  // Realtime
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase.channel('exp_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        loadExpenses();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin, page, filterCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount! <= 0) return alert('المبلغ يجب أن يكون أكبر من 0');
    
    setFormSubmitting(true);
    try {
      if (editingId) {
        await financeService.updateExpense(editingId, formData);
      } else {
        await financeService.createExpense(formData);
      }
      setShowForm(false);
      setFormData({ amount: 0, currency: 'EGP', category: 'operations', description: '', expense_date: new Date().toISOString().split('T')[0] });
      setEditingId(null);
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleExport = () => {
    const exportData = expenses.map(e => ({
      ID: e.id,
      Amount: e.amount,
      Currency: e.currency,
      Category: CATEGORY_LABELS[e.category] || e.category,
      Description: e.description || '',
      Date: new Date(e.expense_date).toLocaleDateString('ar-EG'),
      CreatedBy: e.creator?.full_name || ''
    }));
    financeService.downloadCSV(exportData, 'Expenses');
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
            <FiCreditCard className="text-gold" />
            إدارة المصروفات
          </h1>
          <p className="text-sm text-gray-500 mt-1">إجمالي الحركات المفلترة: {totalCount}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 transition-colors border border-gray-200 dark:border-gray-700">
            <FiDownload /> تصدير CSV
          </button>
          <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ amount: 0, currency: 'EGP', category: 'operations', description: '', expense_date: new Date().toISOString().split('T')[0] }); }} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 transition-colors shadow-sm">
            <FiPlus /> تسجيل مصروف
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-light border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow-sm">
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full md:w-64 py-2 px-4 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-red-500">
          <option value="">جميع التصنيفات</option>
          <option value="marketing">تسويق</option>
          <option value="operations">تشغيل</option>
          <option value="construction">إنشاءات</option>
          <option value="administration">إدارة</option>
          <option value="other">أخرى</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-dark-light border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <FiCreditCard className="w-12 h-12 mb-3 opacity-20" />
            <p>لا توجد مصروفات تطابق بحثك.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 dark:bg-dark/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="p-4 font-semibold">المبلغ</th>
                  <th className="p-4 font-semibold">التصنيف</th>
                  <th className="p-4 font-semibold w-1/3">الوصف</th>
                  <th className="p-4 font-semibold">التاريخ</th>
                  <th className="p-4 font-semibold">المُدخل</th>
                  <th className="p-4 font-semibold">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-dark/50 transition-colors">
                    <td className="p-4 font-bold text-red-600 dark:text-red-400" dir="ltr">
                      - {e.currency} {e.amount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {CATEGORY_LABELS[e.category] || e.category}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{e.description || '—'}</td>
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(e.expense_date).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="p-4 text-gray-500 text-xs">{e.creator?.full_name || '—'}</td>
                    <td className="p-4">
                      <button onClick={() => { setFormData({ ...e, expense_date: String(e.expense_date).split('T')[0] }); setEditingId(e.id); setShowForm(true); }} className="p-2 text-gold hover:bg-gold/10 rounded-lg transition-colors">
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

      {/* Expense Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-dark-light rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl w-full max-w-xl overflow-hidden" dir="rtl">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold text-dark dark:text-white">
                  {editingId ? 'تعديل المصروف' : 'تسجيل مصروف جديد'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">المبلغ (Amount) *</label>
                    <input type="number" required min="1" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} className="w-full px-4 py-2 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-red-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">العملة (Currency) *</label>
                    <input type="text" required value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value.toUpperCase() })} className="w-full px-4 py-2 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-red-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">التصنيف (Category) *</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as Expense['category'] })} className="w-full px-4 py-2 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-red-500">
                      <option value="marketing">تسويق</option>
                      <option value="operations">تشغيل</option>
                      <option value="construction">إنشاءات</option>
                      <option value="administration">إدارة</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">تاريخ المصروف (Date)</label>
                    <input type="date" required value={formData.expense_date ? String(formData.expense_date).split('T')[0] : ''} onChange={e => setFormData({ ...formData, expense_date: e.target.value })} className="w-full px-4 py-2 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-red-500" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">الوصف (Description)</label>
                  <textarea rows={3} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-red-500 resize-none" placeholder="تفاصيل المصروف..." />
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors font-medium">إلغاء</button>
                  <button type="submit" disabled={formSubmitting} className="px-6 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-50">
                    {formSubmitting ? 'جاري الحفظ...' : 'حفظ المصروف'}
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
