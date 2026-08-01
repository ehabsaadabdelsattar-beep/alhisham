import { supabase } from '../lib/supabase';


export interface Project {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  category: 'residential' | 'commercial' | 'mixed';
  status: 'upcoming' | 'planning' | 'under_construction' | 'completed' | 'sold_out';
  progress: number;
  area?: string;
  units?: number;
  start_date?: string;
  completion_date?: string;
  year?: string;
  location_ar?: string;
  location_en?: string;
  address_ar?: string;
  address_en?: string;
  map_embed_url?: string;
  google_maps_url?: string;
  latitude?: number;
  longitude?: number;
  cover_image?: string;
  video_url?: string;
  features?: string[];
  price_from?: number;
  price_to?: number;
  seo_title?: string;
  seo_description?: string;
  featured: boolean;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

export const projectsService = {
  async getProjects(options?: { publishedOnly?: boolean, category?: string, status?: string }) {
    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.publishedOnly) {
      query = query.eq('published', true);
    }
    if (options?.category) {
      query = query.eq('category', options.category);
    }
    if (options?.status) {
      query = query.eq('status', options.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Project[];
  },

  async getProjectBySlug(slug: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*, project_images(*), project_updates(*)')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  async createProject(projectData: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProject(id: string, projectData: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
