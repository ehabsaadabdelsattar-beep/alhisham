import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { crmService } from '../../services/crm';
import type { Lead, LeadStatus, LeadSource, InquiryNote, CRMAnalytics } from '../../services/crm';
import { projectsService } from '../../services/projects';
import type { Project } from '../../services/projects';
import {
  FiTarget, FiPhone, FiMail, FiMessageCircle, FiUser, FiCalendar,
  FiEdit3, FiX, FiPlus, FiSearch, FiDownload, FiClock, FiAlertCircle,
  FiCheckCircle, FiChevronRight, FiActivity, FiBarChart2, FiSend,
} from 'react-icons/fi';

// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────
const PIPELINE: { id: LeadStatus; label: string; color: string; border: string; dot: string }[] = [
  { id: 'new',         label: 'جديد',         color: 'bg-blue-50 dark:bg-blue-900/20',    border: 'border-blue-200 dark:border-blue-800',    dot: 'bg-blue-500' },
  { id: 'contacted',   label: 'تم التواصل',   color: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', dot: 'bg-purple-500' },
  { id: 'qualified',   label: 'مؤهل',         color: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800', dot: 'bg-indigo-500' },
  { id: 'in_progress', label: 'جاري',         color: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-200 dark:border-amber-800',   dot: 'bg-amber-500' },
  { id: 'completed',   label: 'مكتمل',        color: 'bg-emerald-50 dark:bg-emerald-900/20',border: 'border-emerald-200 dark:border-emerald-800',dot: 'bg-emerald-500' },
  { id: 'closed',      label: 'مغلق',         color: 'bg-gray-50 dark:bg-gray-900/20',     border: 'border-gray-200 dark:border-gray-700',     dot: 'bg-gray-400' },
];

const SOURCE_LABELS: Record<string, string> = {
  website: 'الموقع', google: 'Google', facebook: 'Facebook', instagram: 'Instagram',
  tiktok: 'TikTok', whatsapp: 'WhatsApp', referral: 'إحالة', other: 'أخرى',
};

function fmtDate(d: string) {
  return new Date(d).toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function isOverdue(date: string | null) {
  return date ? new Date(date) < new Date() : false;
}

function isToday(date: string | null) {
  if (!date) return false;
  const d = new Date(date);
  const t = new Date();
  return d.toDateString() === t.toDateString();
}

// ─────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, sub }: { label: string; value: number | string; color: string; sub?: string }) {
  return (
    <div className={`rounded-xl p-4 border bg-white dark:bg-dark-light ${color}`}>
      <p className="text-2xl font-bold text-dark dark:text-white tabular-nums">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// LEAD CARD (Kanban)
// ─────────────────────────────────────────────────────────────────
function LeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const overdue = isOverdue(lead.next_follow_up_at);
  const todayFollowUp = isToday(lead.next_follow_up_at);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark rounded-xl border border-gray-100 dark:border-gray-800 p-3.5 cursor-pointer hover:border-gold/40 hover:shadow-md transition-all group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="font-bold text-dark dark:text-white text-sm group-hover:text-gold transition-colors leading-tight">{lead.full_name}</p>
        {lead.next_follow_up_at && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${overdue ? 'bg-red-100 text-red-600' : todayFollowUp ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
            {overdue ? '⏰ متأخر' : todayFollowUp ? '📅 اليوم' : '📅'}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-2 truncate">{lead.project_name || 'بدون مشروع'}</p>
      <div className="flex items-center justify-between">
        {lead.source && <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">{SOURCE_LABELS[lead.source] || lead.source}</span>}
        {lead.assignee && <span className="text-[10px] text-gold truncate max-w-[80px]">{lead.assignee.full_name}</span>}
      </div>
      <p className="text-[10px] text-gray-400 mt-2">{fmtDate(lead.created_at)}</p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// LEAD PROFILE MODAL
// ─────────────────────────────────────────────────────────────────
function LeadModal({ lead, employees, onClose, onUpdated }: {
  lead: Lead;
  employees: { id: string; full_name: string; role: string }[];
  onClose: () => void;
  onUpdated: (l: Lead) => void;
}) {
  const [currentLead, setCurrentLead] = useState<Lead>(lead);
  const [notes, setNotes] = useState<InquiryNote[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [tab, setTab] = useState<'overview' | 'notes' | 'timeline'>('overview');
  const [saving, setSaving] = useState(false);
  const [followUpDate, setFollowUpDate] = useState(lead.next_follow_up_at ? lead.next_follow_up_at.split('T')[0] : '');

  useEffect(() => {
    crmService.getNotes(lead.id).then(setNotes);
    crmService.getActivityTimeline(lead.id).then(setTimeline);
  }, [lead.id]);

  const changeStatus = async (s: LeadStatus) => {
    setSaving(true);
    try {
      const updated = await crmService.updateStatus(lead.id, s, currentLead.status);
      setCurrentLead({ ...currentLead, status: updated.status });
      onUpdated({ ...currentLead, status: updated.status });
    } finally { setSaving(false); }
  };

  const assignTo = async (uid: string | null) => {
    setSaving(true);
    try {
      await crmService.assignLead(lead.id, uid);
      const emp = employees.find(e => e.id === uid) || null;
      const updated = { ...currentLead, assigned_to: uid, assignee: emp ? { full_name: emp.full_name, role: emp.role } : null };
      setCurrentLead(updated); onUpdated(updated);
    } finally { setSaving(false); }
  };

  const saveFollowUp = async () => {
    setSaving(true);
    try {
      await crmService.updateFollowUp(lead.id, followUpDate ? new Date(followUpDate).toISOString() : null);
      const updated = { ...currentLead, next_follow_up_at: followUpDate ? new Date(followUpDate).toISOString() : null };
      setCurrentLead(updated); onUpdated(updated);
    } finally { setSaving(false); }
  };

  const submitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const note = await crmService.addNote(lead.id, newNote.trim());
    setNotes(prev => [note, ...prev]);
    setNewNote('');
  };

  const cols = PIPELINE.find(p => p.id === currentLead.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white dark:bg-dark-light rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/40 to-amber-600/40 flex items-center justify-center text-gold font-bold">
              {currentLead.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-dark dark:text-white">{currentLead.full_name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cols?.dot || 'bg-gray-400'} text-white`}>{cols?.label || currentLead.status}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors"><FiX className="w-5 h-5" /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-4 border-b border-gray-100 dark:border-gray-800">
          {([['overview', 'نظرة عامة'], ['notes', 'الملاحظات'], ['timeline', 'السجل']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === id ? 'bg-gold text-dark' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark'}`}
            >{label}</button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* ═══ Overview Tab ═══ */}
          {tab === 'overview' && (
            <>
              {/* Contact Buttons */}
              <div className="flex gap-2">
                <a href={`tel:${currentLead.phone}`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-bold hover:bg-emerald-500/20 transition-colors">
                  <FiPhone className="w-3.5 h-3.5" /> اتصال
                </a>
                <a href={`https://wa.me/${currentLead.phone}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 text-green-600 text-xs font-bold hover:bg-green-500/20 transition-colors">
                  <FiMessageCircle className="w-3.5 h-3.5" /> واتساب
                </a>
                {currentLead.email && (
                  <a href={`mailto:${currentLead.email}`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600 text-xs font-bold hover:bg-blue-500/20 transition-colors">
                    <FiMail className="w-3.5 h-3.5" /> بريد
                  </a>
                )}
              </div>

              {/* Customer & Lead Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2 bg-gray-50 dark:bg-dark rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">بيانات العميل</p>
                  <p><span className="text-gray-400">الهاتف:</span> <span dir="ltr" className="text-dark dark:text-white font-medium">{currentLead.phone}</span></p>
                  {currentLead.email && <p><span className="text-gray-400">البريد:</span> <span dir="ltr" className="text-dark dark:text-white font-medium">{currentLead.email}</span></p>}
                  <p><span className="text-gray-400">المصدر:</span> <span className="text-dark dark:text-white font-medium">{SOURCE_LABELS[currentLead.source || ''] || 'غير محدد'}</span></p>
                  <p><span className="text-gray-400">وصل في:</span> <span className="text-dark dark:text-white font-medium">{fmtDate(currentLead.created_at)}</span></p>
                </div>
                <div className="space-y-2 bg-gray-50 dark:bg-dark rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">المشروع</p>
                  <p className="font-bold text-dark dark:text-white">{currentLead.project_name || '—'}</p>
                  {currentLead.project && <p className="text-xs text-gray-500">{currentLead.project.status}</p>}
                  {currentLead.transaction && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">معاملة مرتبطة</p>
                      <p className="text-emerald-600 font-bold">{currentLead.transaction.currency} {currentLead.transaction.amount.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              {currentLead.message && (
                <div className="bg-gray-50 dark:bg-dark rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">الرسالة</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{currentLead.message}</p>
                </div>
              )}

              {/* Status Change */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">تغيير المرحلة</p>
                <div className="flex flex-wrap gap-2">
                  {PIPELINE.map(p => (
                    <button key={p.id} disabled={saving || currentLead.status === p.id} onClick={() => changeStatus(p.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${currentLead.status === p.id ? `${p.color} ${p.border} scale-95` : 'border-gray-200 dark:border-gray-700 hover:border-gold/40 text-gray-500 hover:text-gold'} disabled:cursor-not-allowed`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />{p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assign Employee */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">تعيين موظف</p>
                <select disabled={saving} value={currentLead.assigned_to || ''} onChange={e => assignTo(e.target.value || null)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-gold"
                >
                  <option value="">— بدون تعيين —</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.role})</option>)}
                </select>
              </div>

              {/* Follow-up */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">موعد المتابعة</p>
                <div className="flex gap-2">
                  <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-gold"
                  />
                  <button onClick={saveFollowUp} disabled={saving} className="px-4 py-2 bg-gold text-dark rounded-xl font-bold text-sm hover:bg-gold/90 transition-colors disabled:opacity-50">حفظ</button>
                </div>
              </div>
            </>
          )}

          {/* ═══ Notes Tab ═══ */}
          {tab === 'notes' && (
            <>
              <form onSubmit={submitNote} className="flex gap-2">
                <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="أضف ملاحظة داخلية..." required
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-gold"
                />
                <button type="submit" className="px-4 py-2 bg-gold text-dark rounded-xl font-bold hover:bg-gold/90 transition-colors">
                  <FiSend className="w-4 h-4" />
                </button>
              </form>
              <div className="space-y-3">
                {notes.length === 0 ? (
                  <p className="text-center text-gray-400 py-8 text-sm">لا توجد ملاحظات داخلية بعد.</p>
                ) : notes.map(n => (
                  <div key={n.id} className="bg-gray-50 dark:bg-dark rounded-xl p-4">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-gold">{n.author?.full_name || 'موظف'}</span>
                      <span className="text-[10px] text-gray-400">{fmtDate(n.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{n.note}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ═══ Timeline Tab ═══ */}
          {tab === 'timeline' && (
            <div className="space-y-3">
              {timeline.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">لا توجد سجلات حركات بعد.</p>
              ) : timeline.map((act, i) => (
                <div key={act.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-gold mt-1" />
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-dark dark:text-white">
                      <span className="font-bold text-gold">{act.actor?.full_name || 'System'}</span> — {act.action}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(act.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────
export default function AdminCRM() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const isEditor = profile?.role === 'editor';
  const canAccess = isAdmin || isEditor;

  const [leads, setLeads] = useState<Lead[]>([]);
  const [analytics, setAnalytics] = useState<CRMAnalytics | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'table'>('kanban');

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [leadsData, analyticsData, empData] = await Promise.all([
        crmService.getLeads({ search: search || undefined, status: filterStatus || undefined, source: filterSource || undefined }),
        isAdmin ? crmService.getAnalytics() : null,
        crmService.getEmployees(),
      ]);
      setLeads(leadsData.data);
      if (analyticsData) setAnalytics(analyticsData);
      setEmployees(empData);
    } finally { setLoading(false); }
  }, [search, filterStatus, filterSource, isAdmin]);

  useEffect(() => { if (canAccess) load(); }, [load, canAccess]);

  // Realtime
  useEffect(() => {
    if (!canAccess) return;
    const ch = supabase.channel('crm_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiry_notes' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [canAccess, load]);

  const handleLeadUpdated = (updated: Lead) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
    setSelectedLead(updated);
  };

  const getColumnLeads = (status: LeadStatus) => leads.filter(l => l.status === status);

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center" dir="rtl">
        <FiAlertCircle className="w-16 h-16 text-red-500 mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-dark dark:text-white mb-2">غير مصرح لك</h2>
        <p className="text-gray-500">لا تملك الصلاحيات الكافية لعرض هذه الصفحة.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white flex items-center gap-2">
            <FiTarget className="text-gold" />
            نظام إدارة العملاء (CRM)
          </h1>
          <p className="text-sm text-gray-500 mt-1">متابعة العملاء المحتملين من الاستفسار حتى الإغلاق</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView(view === 'kanban' ? 'table' : 'kanban')}
            className="px-4 py-2 bg-gray-100 dark:bg-dark-300 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors border border-gray-200 dark:border-gray-700"
          >
            {view === 'kanban' ? '📋 عرض جدول' : '🗂️ عرض Kanban'}
          </button>
          {isAdmin && (
            <button onClick={() => crmService.exportCSV(leads)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 transition-colors border border-gray-200 dark:border-gray-700"
            >
              <FiDownload /> تصدير CSV
            </button>
          )}
        </div>
      </div>

      {/* Analytics Cards — Admin Only */}
      {isAdmin && analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <StatCard label="الإجمالي" value={analytics.total} color="border-gray-100 dark:border-gray-800" />
          <StatCard label="جديد" value={analytics.new} color="border-blue-100 dark:border-blue-900/30" />
          <StatCard label="تم التواصل" value={analytics.contacted} color="border-purple-100 dark:border-purple-900/30" />
          <StatCard label="مؤهل" value={analytics.qualified} color="border-indigo-100 dark:border-indigo-900/30" />
          <StatCard label="مكتمل" value={analytics.completed} color="border-emerald-100 dark:border-emerald-900/30" />
          <StatCard label="معدل التحويل" value={`${analytics.conversion_rate}%`} color="border-gold/20" />
          <StatCard label="متابعات اليوم" value={analytics.follow_ups_today} color={analytics.follow_ups_overdue > 0 ? 'border-red-200 dark:border-red-900/30' : 'border-gray-100 dark:border-gray-800'} sub={analytics.follow_ups_overdue > 0 ? `${analytics.follow_ups_overdue} متأخرة` : undefined} />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-dark-light border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex flex-wrap gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input placeholder="بحث بالاسم، الإيميل، أو الهاتف..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-gold"
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="py-2 px-4 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-gold">
          <option value="">جميع المراحل</option>
          {PIPELINE.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <select value={filterSource} onChange={e => setFilterSource(e.target.value)} className="py-2 px-4 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-gold">
          <option value="">جميع المصادر</option>
          {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ═══ KANBAN VIEW ═══ */}
          {view === 'kanban' && (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {PIPELINE.map(col => {
                  const colLeads = getColumnLeads(col.id);
                  return (
                    <div key={col.id} className={`w-64 rounded-2xl border p-3 flex flex-col gap-3 ${col.color} ${col.border}`}>
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                          <span className="text-sm font-bold text-dark dark:text-white">{col.label}</span>
                        </div>
                        <span className="text-xs font-bold bg-white dark:bg-dark text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                          {colLeads.length}
                        </span>
                      </div>
                      <div className="space-y-2 min-h-[80px]">
                        {colLeads.length === 0 ? (
                          <p className="text-center text-gray-400 text-xs py-8">لا توجد leads</p>
                        ) : colLeads.map(lead => (
                          <LeadCard key={lead.id} lead={lead} onClick={() => setSelectedLead(lead)} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ TABLE VIEW ═══ */}
          {view === 'table' && (
            <div className="bg-white dark:bg-dark-light border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-gray-50 dark:bg-dark/50 text-gray-500 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="p-4 font-semibold">العميل</th>
                      <th className="p-4 font-semibold">المشروع</th>
                      <th className="p-4 font-semibold">المرحلة</th>
                      <th className="p-4 font-semibold">المصدر</th>
                      <th className="p-4 font-semibold">المسؤول</th>
                      <th className="p-4 font-semibold">المتابعة</th>
                      <th className="p-4 font-semibold">تاريخ</th>
                      <th className="p-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {leads.length === 0 ? (
                      <tr><td colSpan={8} className="p-12 text-center text-gray-400">لا توجد بيانات تطابق البحث.</td></tr>
                    ) : leads.map(lead => {
                      const col = PIPELINE.find(p => p.id === lead.status);
                      const overdue = isOverdue(lead.next_follow_up_at);
                      return (
                        <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-dark/50 transition-colors cursor-pointer" onClick={() => setSelectedLead(lead)}>
                          <td className="p-4"><p className="font-bold text-dark dark:text-white">{lead.full_name}</p><p className="text-xs text-gray-500" dir="ltr">{lead.phone}</p></td>
                          <td className="p-4 text-gray-600 dark:text-gray-300">{lead.project_name || '—'}</td>
                          <td className="p-4">
                            <span className={`flex items-center gap-1.5 w-fit text-xs font-bold px-2.5 py-1 rounded-full border ${col?.color} ${col?.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${col?.dot}`} />{col?.label}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-gray-500">{SOURCE_LABELS[lead.source || ''] || '—'}</td>
                          <td className="p-4 text-xs text-gold">{lead.assignee?.full_name || '—'}</td>
                          <td className="p-4 text-xs">
                            {lead.next_follow_up_at ? (
                              <span className={overdue ? 'text-red-500 font-bold' : 'text-gray-500'}>
                                {overdue ? '⚠️ ' : ''}{new Date(lead.next_follow_up_at).toLocaleDateString('ar-EG')}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="p-4 text-xs text-gray-400">{new Date(lead.created_at).toLocaleDateString('ar-EG')}</td>
                          <td className="p-4"><FiEdit3 className="w-4 h-4 text-gold" /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Lead Modal */}
      <AnimatePresence>
        {selectedLead && (
          <LeadModal
            lead={selectedLead}
            employees={employees}
            onClose={() => setSelectedLead(null)}
            onUpdated={handleLeadUpdated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
