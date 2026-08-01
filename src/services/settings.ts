import { supabase } from '../lib/supabase';

export interface WebsiteSettings {
  company: {
    name_ar: string;
    name_en: string;
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address_ar: string;
    address_en: string;
  };
  social: {
    facebook: string;
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  hero: {
    title_ar: string;
    title_en: string;
    description_ar: string;
    description_en: string;
    image_url: string;
    video_url: string;
  };
  [key: string]: any;
}

export const settingsService = {
  async getSettings() {
    const { data, error } = await supabase.from('website_settings').select('*');
    if (error) throw error;
    
    // Transform array of key-value into a single object
    const settings: any = {};
    data.forEach((row) => {
      settings[row.key] = row.value;
    });
    
    return settings as WebsiteSettings;
  },

  async updateSetting(key: string, value: any) {
    const { data, error } = await supabase
      .from('website_settings')
      .upsert({ key, value })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
