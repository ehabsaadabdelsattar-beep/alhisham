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
  location_name?: string;
  map_embed_url?: string;
  google_maps_url?: string;
  latitude?: number;
  longitude?: number;
  cover_image?: string;
  video_url?: string;
  features?: string[];
  price_from?: number;
  price_to?: number;
  expected_roi?: string;
  payment_plan_ar?: string;
  payment_plan_en?: string;
  brochure_url?: string;
  master_plan_url?: string;
  seo_title?: string;
  seo_description?: string;
  featured: boolean;
  published: boolean;
  created_at?: string;
  updated_at?: string;
  project_images?: Array<{ id: string; image_url: string; caption_ar?: string; caption_en?: string; display_order?: number }>;
  project_updates?: Array<{ id: string; title_ar: string; title_en: string; description_ar?: string; description_en?: string; progress?: number; created_at?: string }>;
}

export const DEFAULT_SHOWCASE_PROJECTS: Project[] = [
  {
    id: 'horizon-mansions',
    slug: 'horizon-mansions',
    title_ar: 'قصور الأفق ريزيدنس الفاخرة',
    title_en: 'Horizon Signature Mansions',
    description_ar: 'قصور معمارية مستقلة صُممت لتمثل قمة الفخامة والخصوصية، واجهات زجاجية ممتدة من الأرض إلى السقف، ومسبح خاص معلق على الروف وحدائق غناء تلتف حول القصر.',
    description_en: 'Bespoke architectural estates crafted for supreme privacy and elegance, featuring panoramic floor-to-ceiling glass, rooftop infinity pool, and lush wrap-around gardens.',
    category: 'residential',
    status: 'under_construction',
    progress: 68,
    area: '850 - 1,200 م²',
    units: 18,
    year: '2026',
    location_ar: 'القاهرة الجديدة، التجمع الخامس',
    location_en: 'New Cairo, Golden Square',
    cover_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=85',
    features: ['مسبح إنفينيتي خاص', 'مصعد بانورامي زجاجي', 'تشطيبات رخامية إيطالية', 'نظام ذكي متكامل', 'جراج تحت الأرض لـ 4 سيارات', 'حديقة خاصة واسعة'],
    price_from: 28000000,
    price_to: 45000000,
    expected_roi: '18% - 22%',
    payment_plan_ar: '10% مقدم وتقسيط حتى 7 سنوات بدون فوائد',
    payment_plan_en: '10% down payment with up to 7 years interest-free installments',
    featured: true,
    published: true,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'al-madar-sky-towers',
    slug: 'al-madar-sky-towers',
    title_ar: 'أبراج المدار البانورامية الشاطئية',
    title_en: 'Al Madar Skyline Towers',
    description_ar: 'برجان شاهقان يجمعان بين الأجنحة الفندقية الفاخرة، والشقق السكنية المطلة مباشرة على مياه البحر الأبيض المتوسط، مع بوليفارد تجاري وترفيهي نابض بالحياة.',
    description_en: 'Twin iconic towers blending ultra-luxury residences, branded hotel suites, and a vibrant waterside retail promenade overlooking the Mediterranean Sea.',
    category: 'mixed',
    status: 'upcoming',
    progress: 25,
    area: '120,000 م²',
    units: 240,
    year: '2027',
    location_ar: 'العلمين الجديدة، الواجهة الشاطئية',
    location_en: 'New Alamein City, Coastal Promenade',
    cover_image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=85',
    features: ['إطلالة بحرية بانورامية 360°', 'شاطئ خاص وكابانات فاخرة', 'مطاعم ونوادٍ صحية عالمية', 'مهبط طائرات هليكوبتر', 'خدمات كونسيرج فندقية 24/7'],
    price_from: 14500000,
    price_to: 32000000,
    expected_roi: '22% - 26%',
    payment_plan_ar: '5% مقدم وتقسيط ميسر على 8 سنوات',
    payment_plan_en: '5% down payment with flexible 8-year installments',
    featured: true,
    published: true,
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'al-nakheel-residence',
    slug: 'al-nakheel-residence',
    title_ar: 'كمبوند النخيل ريزيدنس السكني',
    title_en: 'Al Nakheel Luxury Compound',
    description_ar: 'مجتمع سكني متكامل يضم شققاً فندقية وفيلات تاون هاوس محاطة ببحيرات مائية ومساحات خضراء شاسعة، جاهز للاستلام الفوري.',
    description_en: 'An exclusive gated residential community featuring boutique apartments and garden townhomes woven into lush botanical parks and crystalline lagoons.',
    category: 'residential',
    status: 'completed',
    progress: 100,
    area: '65,000 م²',
    units: 120,
    year: '2024',
    location_ar: 'الشيخ زايد، بيفرلي هيلز',
    location_en: 'Sheikh Zayed City, Beverly Hills',
    cover_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=85',
    features: ['تسليم فوري كامل التشطيب', 'نادي رياضي واجتماعي متكامل', 'ملاعب بادل وتنس', 'مسار ركض مشجر 2 كم', 'أمن وحراسة ذكية 24/7'],
    price_from: 8500000,
    price_to: 19000000,
    expected_roi: '16% - 20%',
    payment_plan_ar: 'استلام فوري بمقدم 20% وأقساط حتى 5 سنوات',
    payment_plan_en: 'Immediate handover with 20% down payment and 5-year plans',
    featured: true,
    published: true,
    created_at: '2026-01-05T10:00:00Z',
  },
  {
    id: 'business-hub',
    slug: 'business-hub',
    title_ar: 'مركز الهشام للأعمال الإداري والتجاري',
    title_en: 'Al Hisham Executive Business Hub',
    description_ar: 'مبنى إداري وتجاري ذكي حاصل على شهادة LEED الذهبية، يوفر مقرات عمل استثنائية للشركات والبنوك العالمية مع قاعات مؤتمرات وأنظمة ذكاء اصطناعي لإدارة الطاقة.',
    description_en: 'A state-of-the-art LEED Gold certified commercial tower engineered for global enterprises, featuring flexible high-tech office suites and automated climate control.',
    category: 'commercial',
    status: 'under_construction',
    progress: 75,
    area: '42,000 م²',
    units: 95,
    year: '2025',
    location_ar: 'العاصمة الإدارية الجديدة، حي المال والأعمال',
    location_en: 'New Administrative Capital, CBD',
    cover_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=85',
    features: ['شهادة LEED للاستدامة', 'مواقف سيارات إلكترونية ذكية', 'قاعات مؤتمرات لكبار الشخصيات', 'ألياف ضوئية وإنترنت فائق السرعة', 'أمن بيومتري وأنظمة مراقبة متطورة'],
    price_from: 6800000,
    price_to: 24000000,
    expected_roi: '24% - 28%',
    payment_plan_ar: '10% مقدم، عوائد إيجارية إجبارية مضمونة بعقد موثق',
    payment_plan_en: '10% down payment with contractual guaranteed rental returns',
    featured: true,
    published: true,
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'oasis-garden-villas',
    slug: 'oasis-garden-villas',
    title_ar: 'فيلات الواحة الخضراء المستقلة',
    title_en: 'Oasis Garden Botanical Villas',
    description_ar: 'فيلات عائلية فاخرة محاطة بأشجار نادرة وبحيرات مائية هادئة، مع تصاميم داخلية عصرية تدمج الحياة المنزلية بالطبيعة الخلابة.',
    description_en: 'Serene botanical villas centered around reflection streams and mature tree canopies, featuring private gardens and shaded outdoor dining verandas.',
    category: 'residential',
    status: 'under_construction',
    progress: 50,
    area: '420 - 650 م²',
    units: 35,
    year: '2026',
    location_ar: 'القاهرة الجديدة، التجمع الخامس',
    location_en: 'New Cairo, North Investors',
    cover_image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80',
    features: ['حديقة خاصة بمسبح تدفئة شتوية', 'تراس عائلي للشواء', 'جناح مستقل للسائق والخدمات', 'نوافذ ألمانية عازلة للصوت والحرارة', 'شواحن سيارات كهربائية EV'],
    price_from: 18000000,
    price_to: 29000000,
    expected_roi: '17% - 21%',
    payment_plan_ar: '10% مقدم وتقسيط حتى 7 سنوات',
    payment_plan_en: '10% down payment, installments up to 7 years',
    featured: false,
    published: true,
    created_at: '2026-02-10T10:00:00Z',
  },
  {
    id: 'boulevard-retail-avenue',
    slug: 'boulevard-retail-avenue',
    title_ar: 'بوليفارد الهشام التجاري والترفيهي',
    title_en: 'Al Hisham Promenade Boulevard',
    description_ar: 'وجهة تسوق وترفيه راقية على الطراز الأوروبي المفتوح، تضم أرقى المطاعم والمتاجر العالمية والمقاهي المطلة على مسطحات مائية بديعة.',
    description_en: 'An open-air Mediterranean retail and dining promenade showcasing premier international boutiques, artisanal cafes, and water reflection avenues.',
    category: 'commercial',
    status: 'planning',
    progress: 15,
    area: '55,000 م²',
    units: 80,
    year: '2027',
    location_ar: 'الساحل الشمالي، رأس الحكمة',
    location_en: 'North Coast, Ras El Hekma',
    cover_image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1600&q=85',
    features: ['بوليفارد مشاة مفتوح', 'علامات تجارية عالمية', 'مطاعم شيف بإطلالة مائية', 'مواقف سطحية وتحت الأرض لـ 1,000 سيارة', 'منطقة فعاليات وعروض موسيقية'],
    price_from: 9500000,
    price_to: 35000000,
    expected_roi: '25% - 30%',
    payment_plan_ar: '5% مقدم وفترة سداد تصل إلى 8 سنوات',
    payment_plan_en: '5% down payment with 8-year payment schedules',
    featured: false,
    published: true,
    created_at: '2026-02-15T10:00:00Z',
  },
];

export const projectsService = {
  async getProjects(options?: { publishedOnly?: boolean, category?: string, status?: string }) {
    try {
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (options?.publishedOnly) {
        query = query.eq('published', true);
      }
      if (options?.category && options.category !== 'all') {
        query = query.eq('category', options.category);
      }
      if (options?.status && options.status !== 'all') {
        query = query.eq('status', options.status);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Project[];
      }
    } catch (err) {
      console.warn('Supabase query failed or empty, serving showcase projects:', err);
    }

    // Curated showcase projects fallback
    let result = [...DEFAULT_SHOWCASE_PROJECTS];
    if (options?.publishedOnly) {
      result = result.filter(p => p.published);
    }
    if (options?.category && options.category !== 'all') {
      result = result.filter(p => p.category === options.category);
    }
    if (options?.status && options.status !== 'all') {
      result = result.filter(p => p.status === options.status);
    }

    return result;
  },

  async getProjectBySlug(slug: string) {
    try {
      // 1. Fetch from Supabase by slug or id
      const { data: dataBySlug } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      let data = dataBySlug;

      if (!data) {
        const { data: dataById } = await supabase
          .from('projects')
          .select('*')
          .eq('id', slug)
          .maybeSingle();

        if (dataById) data = dataById;
      }

      if (data) {
        // Fetch images
        try {
          const { data: images } = await supabase
            .from('project_images')
            .select('*')
            .eq('project_id', data.id)
            .order('display_order', { ascending: true });
          data.project_images = images || [];
        } catch {
          data.project_images = [];
        }

        // Fetch updates
        try {
          const { data: updates } = await supabase
            .from('project_updates')
            .select('*')
            .eq('project_id', data.id)
            .order('created_at', { ascending: false });
          data.project_updates = updates || [];
        } catch {
          data.project_updates = [];
        }

        return data;
      }
    } catch {
      // Fall through to fallback
    }

    // 2. Lookup in default showcase projects
    const fallback = DEFAULT_SHOWCASE_PROJECTS.find(p => p.slug === slug || p.id === slug);
    if (fallback) {
      return {
        ...fallback,
        project_images: [
          { id: 'img-1', image_url: fallback.cover_image || '', caption_ar: 'الواجهة المعمارية الرئيسية', caption_en: 'Main Architectural Facade', display_order: 1 },
          { id: 'img-2', image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=85', caption_ar: 'صالون الاستقبال والمعيشة الفاخر', caption_en: 'Grand Living Salon', display_order: 2 },
          { id: 'img-3', image_url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600&q=85', caption_ar: 'المسبح الخاص والتراس البانورامي', caption_en: 'Private Pool & Sky Terrace', display_order: 3 },
          { id: 'img-4', image_url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1600&q=85', caption_ar: 'التشطيبات الفندقية للأجنحة الملكية', caption_en: 'Master Suite Finishes', display_order: 4 },
        ],
        project_updates: [
          { id: 'up-1', title_ar: 'اكتمال صب الهيكل الخرساني والأساسات', title_en: 'Structural Foundations Completed', description_ar: 'تم الانتهاء بنجاح من صب الأساسات والهيكل الخرساني وفق أعلى مواصفات الكود الهندسي العالمي.', description_en: 'Foundations and concrete superstructure successfully completed.', progress: fallback.progress, created_at: '2026-09-15' },
          { id: 'up-2', title_ar: 'بدء أعمال الواجهات الزجاجية الفاخرة', title_en: 'Curtain Wall Facades Underway', description_ar: 'تم توريد وتركيب قطاعات الألومنيوم والزجاج العازل للصوت والحرارة.', description_en: 'Installation of high-performance acoustic and thermal glazed facades.', progress: Math.max(0, fallback.progress - 15), created_at: '2026-10-01' },
        ]
      };
    }

    throw new Error('Project not found');
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
