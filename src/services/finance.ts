import { supabase } from '../lib/supabase';

// Types
export interface Transaction {
  id: string;
  user_id: string | null;
  project_id: string | null;
  amount: number;
  currency: string;
  type: 'investment' | 'payment' | 'refund' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields for display
  profiles?: { full_name: string } | null;
  projects?: { title_ar: string; title_en: string } | null;
}

export interface Expense {
  id: string;
  category: 'marketing' | 'operations' | 'construction' | 'administration' | 'other';
  description: string | null;
  amount: number;
  currency: string;
  expense_date: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  creator?: { full_name: string } | null;
}

// Helper to log activities
async function logFinanceActivity(action: string, entity: string, entity_id: string, details?: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action,
      entity,
      entity_id,
      details: details ? JSON.stringify(details) : null
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

export const financeService = {
  // ─────────────────────────────────────────────────────────────────
  // Transactions
  // ─────────────────────────────────────────────────────────────────
  async getTransactions(options?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    project_id?: string;
    search?: string;
  }) {
    const { page = 1, limit = 50, status, type, project_id, search } = options || {};
    let query = supabase
      .from('transactions')
      .select(`
        *,
        profiles:user_id ( full_name ),
        projects:project_id ( title_ar, title_en )
      `, { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);
    if (project_id) query = query.eq('project_id', project_id);
    
    // Simplistic search approximation (ideally done via RPC or full-text, but we rely on joins here so we might filter in memory if complex, or rely on exact match if UUID)
    // For now we skip text search on joined fields directly via Supabase query to keep it clean, relying on UI filters.
    
    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.order('transaction_date', { ascending: false }).range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;
    
    return { data: data as Transaction[], count: count || 0 };
  },

  async createTransaction(tx: Partial<Transaction>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(tx)
      .select()
      .single();
    if (error) throw error;
    
    await logFinanceActivity('Created', 'Transaction', data.id, { amount: tx.amount, type: tx.type });
    return data as Transaction;
  },

  async updateTransaction(id: string, updates: Partial<Transaction>) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    
    await logFinanceActivity('Updated', 'Transaction', id, updates);
    return data as Transaction;
  },

  // ─────────────────────────────────────────────────────────────────
  // Expenses
  // ─────────────────────────────────────────────────────────────────
  async getExpenses(options?: {
    page?: number;
    limit?: number;
    category?: string;
  }) {
    const { page = 1, limit = 50, category } = options || {};
    let query = supabase
      .from('expenses')
      .select(`
        *,
        creator:created_by ( full_name )
      `, { count: 'exact' });

    if (category) query = query.eq('category', category);
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.order('expense_date', { ascending: false }).range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;
    
    return { data: data as Expense[], count: count || 0 };
  },

  async createExpense(expense: Partial<Expense>) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('expenses')
      .insert({ ...expense, created_by: user?.id })
      .select()
      .single();
    if (error) throw error;
    
    await logFinanceActivity('Created', 'Expense', data.id, { amount: expense.amount, category: expense.category });
    return data as Expense;
  },

  async updateExpense(id: string, updates: Partial<Expense>) {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    
    await logFinanceActivity('Updated', 'Expense', id, updates);
    return data as Expense;
  },

  // ─────────────────────────────────────────────────────────────────
  // Export Utility (CSV)
  // ─────────────────────────────────────────────────────────────────
  downloadCSV(data: any[], filename: string) {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(h => {
          let val = row[h];
          if (val === null || val === undefined) val = '';
          else if (typeof val === 'object') val = JSON.stringify(val).replace(/"/g, '""');
          else val = String(val).replace(/"/g, '""');
          return `"${val}"`;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
