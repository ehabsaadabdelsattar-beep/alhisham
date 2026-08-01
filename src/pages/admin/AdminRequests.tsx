import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { inquiriesService } from '../../services/inquiries';
import type { Inquiry } from '../../services/inquiries';
import {
  FiInbox, FiSearch, FiFilter, FiRefreshCw,
  FiUser, FiMail, FiPhone, FiMessageSquare,
  FiCalendar, FiEdit3, FiTrash2, FiX,
  FiCheckCircle, FiAlertCircle, FiClock, FiChevronDown,
  FiBell,
} from 'react-icons/fi';

// ─────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────
const STATUS_META: Record<string, { label: string; color: string; dot: string }> = {
  new:         { label: 'جديد',       color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',    dot: 'bg-blue-400' },
  contacted:   { label: 'تم التواصل', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30', dot: 'bg-purple-400' },
  in_progress: { label: 'جاري',       color: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' },
  completed:   { label: 'مكتمل',      color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
  closed:      { label: 'مغلق',       color: 'bg-gray-500/15 text-gray-400 border-gray-500/30',    dot: 'bg-gray-500' },
};

const ALL_STATUSES = Object.keys(STATUS_META) as Inquiry['status'][];

function fmtDate(d: string) {
  return new Date(d).toLocaleString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─────────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] || STATUS_META.new;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${m.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-light border border-gray-100 dark:border-gray-800 rounded-xl p-5 flex items-center gap-4"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-dark dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Detail Modal
// ─────────────────────────────────────────────────────────────────
function InquiryModal({
  inquiry,
  onClose,
  onStatusChange,
}: {
  inquiry: Inquiry;
  onClose: () => void;
  onStatusChange: (id: string, s: Inquiry['status']) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Inquiry['status']>(inquiry.status);

  const save = async (newStatus: Inquiry['status']) => {
    setStatus(newStatus);
    setSaving(true);
    try {
      await inquiriesService.updateStatus(inquiry.id, newStatus);
      onStatusChange(inquiry.id, newStatus);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white dark:bg-dark-light rounded-2xl border border-gray-100 dark:border-gray-800 w-full max-w-lg shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-dark dark:text-white flex items-center gap-2">
              <FiMessageSquare className="text-gold w-5 h-5" />
              تفاصيل الطلب
            </h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <FiX className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
            {/* Customer Info */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">معلومات العميل</p>
              <div className="bg-gray-50 dark:bg-dark rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-3">
                  <FiUser className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-dark dark:text-white font-medium">{inquiry.full_name}</span>
                </div>
                {inquiry.email && (
                  <div className="flex items-center gap-3">
                    <FiMail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a href={`mailto:${inquiry.email}`} className="text-sm text-gold hover:underline" dir="ltr">{inquiry.email}</a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <FiPhone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <a href={`tel:${inquiry.phone}`} className="text-sm text-gold hover:underline" dir="ltr">{inquiry.phone}</a>
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">المشروع</p>
              <div className="bg-gray-50 dark:bg-dark rounded-xl p-4">
                <p className="text-sm text-dark dark:text-white font-medium">{inquiry.project_name || '—'}</p>
                {inquiry.project_id && (
                  <p className="text-xs text-gray-400 font-mono mt-1" dir="ltr">{inquiry.project_id}</p>
                )}
              </div>
            </div>

            {/* Message */}
            {inquiry.message && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">الرسالة</p>
                <div className="bg-gray-50 dark:bg-dark rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{inquiry.message}</p>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">تاريخ الإرسال</p>
                <p className="text-xs text-dark dark:text-gray-300">{fmtDate(inquiry.created_at)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">آخر تحديث</p>
                <p className="text-xs text-dark dark:text-gray-300">{fmtDate(inquiry.updated_at)}</p>
              </div>
            </div>

            {/* Status Management */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">تغيير الحالة</p>
              <div className="grid grid-cols-3 gap-2">
                {ALL_STATUSES.map(s => {
                  const m = STATUS_META[s];
                  const isActive = status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => save(s)}
                      disabled={saving || isActive}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        isActive ? `${m.color} scale-95` : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gold/40 hover:text-gold'
                      } disabled:cursor-not-allowed`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────
export default function AdminRequests() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({ total: 0, new: 0, contacted: 0, in_progress: 0, completed: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newAlert, setNewAlert] = useState(false);
  const prevCount = useRef(0);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    try {
      const [data, c] = await Promise.all([
        inquiriesService.getInquiries({ status: filterStatus || undefined, search: search || undefined }),
        inquiriesService.getCounts(),
      ]);
      setInquiries(data);
      setCounts(c);
      // Check if new inquiries arrived
      if (prevCount.current > 0 && c.total > prevCount.current) {
        setNewAlert(true);
        showToast('success', `طلب استفسار جديد وصل! (${c.new} طلب جديد)`);
      }
      prevCount.current = c.total;
    } catch (err: any) {
      showToast('error', 'خطأ في تحميل البيانات: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-inquiries-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries' },
        () => {
          load();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const handleStatusChange = (id: string, newStatus: Inquiry['status']) => {
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    setCounts(prev => {
      // Recalculate counts
      const updated = { ...prev };
      return updated;
    });
    showToast('success', 'تم تحديث الحالة بنجاح ✓');
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    try {
      await inquiriesService.deleteInquiry(id);
      setInquiries(prev => prev.filter(i => i.id !== id));
      showToast('success', 'تم حذف الطلب.');
      if (selected?.id === id) setSelected(null);
    } catch (err: any) {
      showToast('error', 'خطأ في الحذف: ' + err.message);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-semibold shadow-xl border ${
              toast.type === 'success'
                ? 'bg-emerald-900/90 text-emerald-300 border-emerald-700'
                : 'bg-red-900/90 text-red-300 border-red-700'
            } backdrop-blur-xl`}
          >
            {toast.type === 'success' ? <FiCheckCircle className="w-4 h-4" /> : <FiAlertCircle className="w-4 h-4" />}
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Alert Bell */}
      {newAlert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 rounded-xl px-5 py-3 cursor-pointer"
          onClick={() => { setNewAlert(false); setFilterStatus('new'); }}
        >
          <FiBell className="text-blue-400 w-4 h-4 animate-bounce" />
          <span className="text-blue-300 text-sm font-semibold">طلبات جديدة وصلت — اضغط للعرض</span>
          <button onClick={e => { e.stopPropagation(); setNewAlert(false); }} className="text-blue-400/60 hover:text-blue-400 mr-auto">
            <FiX className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white flex items-center gap-2">
            <FiInbox className="text-gold" />
            إدارة طلبات الاستفسار
          </h1>
          <p className="text-sm text-gray-500 mt-1">إجمالي الطلبات: {counts.total}</p>
        </div>
        <button
          onClick={() => { setLoading(true); load(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors text-sm"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'الإجمالي', key: 'total', icon: FiInbox, color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300' },
          { label: 'جديد', key: 'new', icon: FiAlertCircle, color: 'bg-blue-500/10 text-blue-400' },
          { label: 'تم التواصل', key: 'contacted', icon: FiPhone, color: 'bg-purple-500/10 text-purple-400' },
          { label: 'جاري', key: 'in_progress', icon: FiClock, color: 'bg-amber-500/10 text-amber-400' },
          { label: 'مكتمل', key: 'completed', icon: FiCheckCircle, color: 'bg-emerald-500/10 text-emerald-400' },
          { label: 'مغلق', key: 'closed', icon: FiX, color: 'bg-gray-500/10 text-gray-400' },
        ].map(({ label, key, icon, color }) => (
          <StatCard key={key} label={label} value={counts[key] || 0} icon={icon} color={color} />
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-light border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="بحث بالاسم، الإيميل، الهاتف، أو المشروع..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 pr-10 pl-4 text-dark dark:text-white focus:outline-none focus:border-gold text-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 px-4 text-dark dark:text-white focus:outline-none focus:border-gold text-sm"
        >
          <option value="">جميع الحالات</option>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{STATUS_META[s].label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-light border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">جاري تحميل الطلبات...</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <FiInbox className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-base font-medium mb-1">لا توجد طلبات بعد</p>
            <p className="text-sm opacity-70">ستظهر هنا عند إرسال عميل طلب استفسار من الموقع.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 dark:bg-dark-300 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="p-4 font-semibold">العميل</th>
                  <th className="p-4 font-semibold">البريد والهاتف</th>
                  <th className="p-4 font-semibold">المشروع</th>
                  <th className="p-4 font-semibold">الحالة</th>
                  <th className="p-4 font-semibold">تاريخ الطلب</th>
                  <th className="p-4 font-semibold text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {inquiries.map(inq => (
                  <motion.tr
                    key={inq.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-dark-300/50 transition-colors"
                  >
                    {/* Customer */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold/40 to-amber-600/40 flex items-center justify-center text-gold font-bold text-sm flex-shrink-0">
                          {inq.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-dark dark:text-white text-sm">{inq.full_name}</p>
                          {inq.user_id ? (
                            <span className="text-[10px] text-emerald-400 font-medium">مسجل ✓</span>
                          ) : (
                            <span className="text-[10px] text-gray-400">زائر</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="p-4">
                      <div className="space-y-1">
                        {inq.email && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300" dir="ltr">
                            <FiMail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate max-w-[180px]">{inq.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300" dir="ltr">
                          <FiPhone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{inq.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Project */}
                    <td className="p-4">
                      <span className="text-sm text-dark dark:text-white">{inq.project_name || '—'}</span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <div className="relative">
                        <select
                          value={inq.status}
                          onChange={async e => {
                            const newS = e.target.value as Inquiry['status'];
                            try {
                              await inquiriesService.updateStatus(inq.id, newS);
                              handleStatusChange(inq.id, newS);
                            } catch { showToast('error', 'خطأ في التحديث'); }
                          }}
                          className="appearance-none bg-transparent border-0 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                          style={{ color: STATUS_META[inq.status]?.dot?.replace('bg-', '') === 'blue-400' ? '#60a5fa' : undefined }}
                        >
                          {ALL_STATUSES.map(s => (
                            <option key={s} value={s}>{STATUS_META[s].label}</option>
                          ))}
                        </select>
                        <StatusBadge status={inq.status} />
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-xs text-gray-500">
                      {fmtDate(inq.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setSelected(inq)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold text-xs font-medium transition-colors"
                        >
                          <FiEdit3 className="w-3.5 h-3.5" />
                          عرض
                        </button>
                        <button
                          onClick={() => handleDelete(inq.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <InquiryModal
          inquiry={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
