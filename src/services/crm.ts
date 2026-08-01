import { supabase } from '../lib/supabase';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'in_progress' | 'completed' | 'closed';
export type LeadSource = 'website' | 'google' | 'facebook' | 'instagram' | 'tiktok' | 'whatsapp' | 'referral' | 'other';

export interface Lead {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string | null;
  phone: string;
  project_id: string | null;
  project_name: string | null;
  message: string | null;
  status: LeadStatus;
  source: LeadSource | null;
  assigned_to: string | null;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  transaction_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;

  // Joined
  project?: { title_ar: string; title_en: string; status: string } | null;
  assignee?: { full_name: string; role: string } | null;
  transaction?: { amount: number; currency: string; status: string } | null;
}

export interface InquiryNote {
  id: string;
  inquiry_id: string;
  created_by: string;
  note: string;
  created_at: string;
  author?: { full_name: string } | null;
}

export interface CRMAnalytics {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  in_progress: number;
  completed: number;
  closed: number;
  today: number;
  this_month: number;
  conversion_rate: number;
  leads_by_project: { project_name: string; count: number }[];
  leads_by_source: { source: string; count: number }[];
  leads_by_status: { status: string; count: number }[];
  follow_ups_today: number;
  follow_ups_overdue: number;
}

// ─────────────────────────────────────────────────────────────────
// Helper: log to activity_logs
// ─────────────────────────────────────────────────────────────────
async function logCRMActivity(action: string, entity_id: string, details?: object) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action,
      entity: 'Lead',
      entity_id,
      details: details ? JSON.stringify(details) : null,
    });
  } catch (_) { /* silently fail */ }
}

// ─────────────────────────────────────────────────────────────────
// CRM Service
// ─────────────────────────────────────────────────────────────────
export const crmService = {

  // ── Leads CRUD ──────────────────────────────────────────────
  async getLeads(opts?: {
    status?: string;
    project_id?: string;
    source?: string;
    assigned_to?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, project_id, source, assigned_to, search, page = 1, limit = 100 } = opts || {};

    let q = supabase
      .from('inquiries')
      .select(`
        *,
        project:project_id ( title_ar, title_en, status ),
        assignee:assigned_to ( full_name, role ),
        transaction:transaction_id ( amount, currency, status )
      `, { count: 'exact' });

    if (status) q = q.eq('status', status);
    if (project_id) q = q.eq('project_id', project_id);
    if (source) q = q.eq('source', source);
    if (assigned_to) q = q.eq('assigned_to', assigned_to);
    if (search) q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);

    const from = (page - 1) * limit;
    q = q.order('created_at', { ascending: false }).range(from, from + limit - 1);

    const { data, count, error } = await q;
    if (error) throw error;
    return { data: data as Lead[], count: count || 0 };
  },

  async updateStatus(id: string, newStatus: LeadStatus, oldStatus: LeadStatus) {
    const { data, error } = await supabase
      .from('inquiries')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await logCRMActivity('Status Changed', id, { from: oldStatus, to: newStatus });
    return data as Lead;
  },

  async assignLead(id: string, employeeId: string | null) {
    const { data, error } = await supabase
      .from('inquiries')
      .update({ assigned_to: employeeId })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await logCRMActivity('Assigned', id, { assigned_to: employeeId });
    return data as Lead;
  },

  async updateFollowUp(id: string, nextFollowUpAt: string | null) {
    const { data, error } = await supabase
      .from('inquiries')
      .update({ next_follow_up_at: nextFollowUpAt })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await logCRMActivity('Follow-up Updated', id, { next_follow_up_at: nextFollowUpAt });
    return data as Lead;
  },

  async linkTransaction(id: string, transactionId: string | null) {
    const { data, error } = await supabase
      .from('inquiries')
      .update({ transaction_id: transactionId })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await logCRMActivity('Linked to Transaction', id, { transaction_id: transactionId });
    return data as Lead;
  },

  // ── Notes ──────────────────────────────────────────────────
  async getNotes(inquiryId: string) {
    const { data, error } = await supabase
      .from('inquiry_notes')
      .select('*, author:created_by ( full_name )')
      .eq('inquiry_id', inquiryId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as InquiryNote[];
  },

  async addNote(inquiryId: string, note: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('inquiry_notes')
      .insert({ inquiry_id: inquiryId, note, created_by: user?.id })
      .select('*, author:created_by ( full_name )')
      .single();
    if (error) throw error;
    await logCRMActivity('Note Added', inquiryId, { preview: note.slice(0, 60) });
    return data as InquiryNote;
  },

  // ── Activity Logs ───────────────────────────────────────────
  async getActivityTimeline(inquiryId: string) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, actor:user_id ( full_name )')
      .eq('entity_id', inquiryId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data;
  },

  // ── Analytics ───────────────────────────────────────────────
  async getAnalytics(): Promise<CRMAnalytics> {
    const now = new Date().toISOString();
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

    const [total, statusCounts, todayCounts, monthCounts, byProject, bySource, followToday, followOverdue] = await Promise.all([
      supabase.from('inquiries').select('id', { count: 'exact', head: true }),
      supabase.from('inquiries').select('status').order('status'),
      supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
      supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString()),
      supabase.from('inquiries').select('project_name, id').not('project_name', 'is', null),
      supabase.from('inquiries').select('source').not('source', 'is', null),
      supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('next_follow_up_at', todayStart.toISOString()).lte('next_follow_up_at', new Date(todayStart.getTime() + 86400000).toISOString()),
      supabase.from('inquiries').select('id', { count: 'exact', head: true }).lt('next_follow_up_at', now).neq('status', 'completed').neq('status', 'closed'),
    ]);

    const statuses = (statusCounts.data || []);
    const counts: Record<string, number> = {};
    statuses.forEach((r: any) => { counts[r.status] = (counts[r.status] || 0) + 1; });

    // Conversion = (completed) / total
    const completedCount = counts['completed'] || 0;
    const totalCount = total.count || 0;
    const conversion_rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // By project
    const projectMap: Record<string, number> = {};
    (byProject.data || []).forEach((r: any) => { if (r.project_name) projectMap[r.project_name] = (projectMap[r.project_name] || 0) + 1; });
    const leads_by_project = Object.entries(projectMap).map(([project_name, count]) => ({ project_name, count })).sort((a, b) => b.count - a.count).slice(0, 10);

    // By source
    const sourceMap: Record<string, number> = {};
    (bySource.data || []).forEach((r: any) => { if (r.source) sourceMap[r.source] = (sourceMap[r.source] || 0) + 1; });
    const leads_by_source = Object.entries(sourceMap).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count);

    return {
      total: totalCount,
      new: counts['new'] || 0,
      contacted: counts['contacted'] || 0,
      qualified: counts['qualified'] || 0,
      in_progress: counts['in_progress'] || 0,
      completed: completedCount,
      closed: counts['closed'] || 0,
      today: todayCounts.count || 0,
      this_month: monthCounts.count || 0,
      conversion_rate,
      leads_by_project,
      leads_by_source,
      leads_by_status: Object.entries(counts).map(([status, count]) => ({ status, count })),
      follow_ups_today: followToday.count || 0,
      follow_ups_overdue: followOverdue.count || 0,
    };
  },

  // ── Employees (for assignment) ──────────────────────────────
  async getEmployees() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .in('role', ['admin', 'editor'])
      .order('full_name');
    if (error) return [];
    return data;
  },

  // ── Export ─────────────────────────────────────────────────
  exportCSV(leads: Lead[]) {
    const headers = ['Name', 'Email', 'Phone', 'Project', 'Status', 'Source', 'Assigned To', 'Created', 'Next Follow-up'];
    const rows = leads.map(l => [
      l.full_name,
      l.email || '',
      l.phone,
      l.project_name || '',
      l.status,
      l.source || '',
      l.assignee?.full_name || '',
      new Date(l.created_at).toLocaleDateString('ar-EG'),
      l.next_follow_up_at ? new Date(l.next_follow_up_at).toLocaleDateString('ar-EG') : '',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Leads_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  },
};
