import { supabase } from '../lib/supabase';

export interface DashboardKPIs {
  total_projects: number;
  active_projects: number;
  total_customers: number;
  total_investors: number;
  total_leads: number;
  new_leads: number;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  total_views: number;
}

export const dashboardService = {
  async getKPIs(startDate: string, endDate: string): Promise<DashboardKPIs> {
    const { data, error } = await supabase.rpc('get_dashboard_kpis', {
      start_date: startDate,
      end_date: endDate
    });
    
    if (error) {
      console.error('Error fetching KPIs:', error);
      // Fallback if RPC is not deployed yet (graceful degradation)
      return {
        total_projects: 0,
        active_projects: 0,
        total_customers: 0,
        total_investors: 0,
        total_leads: 0,
        new_leads: 0,
        total_revenue: 0,
        total_expenses: 0,
        net_profit: 0,
        total_views: 0
      };
    }
    
    return data as DashboardKPIs;
  },

  async getRecentActivity() {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        id, action, entity, created_at,
        profiles:user_id ( full_name )
      `)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) throw error;
    return data;
  },

  async getTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, amount, currency, type, status, transaction_date')
      .order('transaction_date', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('Transactions fetch error:', error);
      return [];
    }
    return data;
  }
};
