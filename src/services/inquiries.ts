import { supabase } from '../lib/supabase';

export interface Inquiry {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string | null;
  phone: string;
  project_id: string | null;
  project_name: string | null;
  message: string | null;
  status: 'new' | 'contacted' | 'in_progress' | 'completed' | 'closed';
  created_at: string;
  updated_at: string;
}

export type CreateInquiryPayload = {
  user_id?: string | null;
  full_name: string;
  email?: string;
  phone: string;
  project_id?: string | null;
  project_name?: string | null;
  message?: string;
};

const inquiriesService = {
  /** Submit a new inquiry (public — works for guests & logged-in users) */
  async createInquiry(payload: CreateInquiryPayload): Promise<Inquiry> {
    const { data, error } = await supabase
      .from('inquiries')
      .insert([{ ...payload, status: 'new' }])
      .select()
      .single();

    if (error) throw error;
    return data as Inquiry;
  },

  /** Admin: get all inquiries with optional filters */
  async getInquiries(filters?: {
    status?: string;
    search?: string;
    project_id?: string;
  }): Promise<Inquiry[]> {
    let query = supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.project_id) query = query.eq('project_id', filters.project_id);
    if (filters?.search) {
      query = query.or(
        `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,project_name.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Inquiry[];
  },

  /** Admin: update status */
  async updateStatus(
    id: string,
    status: Inquiry['status']
  ): Promise<void> {
    const { error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },

  /** Admin: delete */
  async deleteInquiry(id: string): Promise<void> {
    const { error } = await supabase.from('inquiries').delete().eq('id', id);
    if (error) throw error;
  },

  /** Admin: get counts by status */
  async getCounts(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('inquiries')
      .select('status');
    if (error) throw error;

    const counts: Record<string, number> = {
      total: 0,
      new: 0,
      contacted: 0,
      in_progress: 0,
      completed: 0,
      closed: 0,
    };
    (data || []).forEach((row: any) => {
      counts.total += 1;
      if (counts[row.status] !== undefined) counts[row.status] += 1;
    });
    return counts;
  },
};

export { inquiriesService };
