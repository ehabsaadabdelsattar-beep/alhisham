// Projects Data
export interface Project {
  id: string;
  titleAr: string;
  titleEn: string;
  locationAr: string;
  locationEn: string;
  category: 'residential' | 'commercial' | 'mixed';
  status: 'completed' | 'ongoing' | 'upcoming';
  progress: number;
  image: string;
  images: string[];
  descriptionAr: string;
  descriptionEn: string;
  features: string[];
  area: string;
  year: string;
  units?: number;
  videoUrl?: string;
  mapEmbedUrl?: string;
}

export const projects: Project[] = [
  {
    id: 'al-nakheel-residence',
    titleAr: 'مشروع النخيل السكني',
    titleEn: 'Al Nakheel Residence',
    locationAr: 'الرياض، حي النرجس',
    locationEn: 'Riyadh, Al Narjis District',
    category: 'residential',
    status: 'completed',
    progress: 100,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80',
    ],
    descriptionAr: 'مجمع سكني فاخر يتكون من 120 وحدة سكنية متنوعة بين الشقق والفلل، مصمم وفق أحدث المعايير الهندسية العالمية مع مرافق متكاملة.',
    descriptionEn: 'A luxury residential complex consisting of 120 diverse residential units including apartments and villas, designed according to the latest international engineering standards with comprehensive facilities.',
    features: ['حمام سباحة', 'نادي رياضي', 'حديقة خضراء', 'موقف سيارات', 'أمن 24/7', 'غرفة للحراسة'],
    area: '45,000',
    year: '2023',
    units: 120,
    mapEmbedUrl: 'https://maps.google.com/maps?q=24.7136,46.6753&z=15&output=embed',
  },
  {
    id: 'al-waha-tower',
    titleAr: 'برج الواحة التجاري',
    titleEn: 'Al Waha Commercial Tower',
    locationAr: 'جدة، حي الشاطئ',
    locationEn: 'Jeddah, Al Shati District',
    category: 'commercial',
    status: 'ongoing',
    progress: 72,
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80',
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1200&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
    ],
    descriptionAr: 'برج تجاري شاهق من 32 طابقاً يوفر بيئة أعمال متكاملة بمواصفات دولية، يضم مساحات مكتبية ومحلات تجارية فاخرة.',
    descriptionEn: 'A 32-story commercial skyscraper providing a comprehensive business environment with international specifications, featuring office spaces and luxury retail outlets.',
    features: ['مساحات مكتبية ذكية', 'مطاعم فاخرة', 'قاعات مؤتمرات', 'موقف متعدد الطوابق', 'نظام BMS', 'إنترنت فائق السرعة'],
    area: '68,000',
    year: '2024',
    mapEmbedUrl: 'https://maps.google.com/maps?q=21.5433,39.1728&z=15&output=embed',
  },
  {
    id: 'al-madar-complex',
    titleAr: 'مجمع المدار متعدد الاستخدامات',
    titleEn: 'Al Madar Mixed-Use Complex',
    locationAr: 'الدمام، حي الفيصلية',
    locationEn: 'Dammam, Al Faisaliyah District',
    category: 'mixed',
    status: 'upcoming',
    progress: 15,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80',
    ],
    descriptionAr: 'مشروع ضخم متعدد الاستخدامات يجمع بين السكن الفاخر والتجارة والترفيه على مساحة 120 ألف متر مربع في قلب المدينة.',
    descriptionEn: 'A mega mixed-use project combining luxury living, retail, and entertainment across 120,000 square meters in the heart of the city.',
    features: ['وحدات سكنية', 'مركز تجاري', 'فندق 5 نجوم', 'مركز ترفيهي', 'مسجد', 'حدائق عامة'],
    area: '120,000',
    year: '2025',
    units: 350,
    mapEmbedUrl: 'https://maps.google.com/maps?q=26.4207,50.0888&z=15&output=embed',
  },
  {
    id: 'green-villas',
    titleAr: 'مشروع الفلل الخضراء',
    titleEn: 'Green Villas Project',
    locationAr: 'الرياض، حي العليا',
    locationEn: 'Riyadh, Al Olaya District',
    category: 'residential',
    status: 'completed',
    progress: 100,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    ],
    descriptionAr: 'مشروع فلل فاخرة بتصميم عصري يجمع بين الطراز العربي الأصيل والمعمار الحديث مع مساحات خضراء واسعة.',
    descriptionEn: 'A luxury villa project with modern design combining authentic Arabic style with contemporary architecture and expansive green spaces.',
    features: ['حديقة خاصة', 'مسبح خاص', 'غرفة خادمة', 'مجلس واسع', 'مطبخ مجهز', 'غرفة سينما'],
    area: '32,000',
    year: '2022',
    units: 45,
    mapEmbedUrl: 'https://maps.google.com/maps?q=24.6877,46.6805&z=15&output=embed',
  },
  {
    id: 'business-hub',
    titleAr: 'مركز الأعمال الذكي',
    titleEn: 'Smart Business Hub',
    locationAr: 'الرياض، حي العقيق',
    locationEn: 'Riyadh, Al Aqiq District',
    category: 'commercial',
    status: 'ongoing',
    progress: 45,
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1200&q=80',
    ],
    descriptionAr: 'مركز أعمال ذكي متكامل مجهز بأحدث التقنيات لاستضافة الشركات التقنية والناشئة في بيئة إبداعية محفزة.',
    descriptionEn: 'A fully integrated smart business center equipped with the latest technologies to host tech and startup companies in a stimulating creative environment.',
    features: ['مكاتب مرنة', 'مساحات تشاركية', 'مختبرات ابتكار', 'قاعة عروض', 'كافيه', 'ألواح طاقة شمسية'],
    area: '28,000',
    year: '2024',
    mapEmbedUrl: 'https://maps.google.com/maps?q=24.7247,46.6183&z=15&output=embed',
  },
  {
    id: 'luxury-towers',
    titleAr: 'أبراج الفخامة',
    titleEn: 'Luxury Towers',
    locationAr: 'جدة، كورنيش جدة',
    locationEn: 'Jeddah, Jeddah Corniche',
    category: 'mixed',
    status: 'upcoming',
    progress: 5,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
    ],
    descriptionAr: 'مشروع فاخر على كورنيش جدة يتكون من برجين شاهقين على البحر، يضمان شققاً فندقية ووحدات سكنية فاخرة مع إطلالات خلابة على البحر الأحمر.',
    descriptionEn: 'A luxury seaside project on Jeddah Corniche consisting of two soaring towers featuring hotel apartments and luxury residential units with breathtaking views of the Red Sea.',
    features: ['إطلالة بحرية', 'شقق فندقية', 'مطعم دوار', 'سبا فاخر', 'مرسى خاص', 'نادي بيتش'],
    area: '95,000',
    year: '2026',
    units: 280,
    mapEmbedUrl: 'https://maps.google.com/maps?q=21.5433,39.1728&z=15&output=embed',
  },
];

// Testimonials Data
export interface Testimonial {
  id: string;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  textAr: string;
  textEn: string;
  rating: number;
  image: string;
}

export const testimonials: Testimonial[] = [
  {
    id: '1',
    nameAr: 'المهندس فهد العتيبي',
    nameEn: 'Eng. Fahad Al-Otaibi',
    roleAr: 'مستثمر عقاري',
    roleEn: 'Real Estate Investor',
    textAr: 'تعاملت مع شركة الهشام للتطوير العقاري في مشروع الأبراج السكني، وكان التجربة استثنائية من حيث الجودة والالتزام بالمواعيد. فريق محترف جداً ويستحق كل الثقة.',
    textEn: 'I worked with AL HISHAM DEVELOPMENT on a residential towers project, and the experience was exceptional in terms of quality and meeting deadlines. A very professional team that deserves all the trust.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
  },
  {
    id: '2',
    nameAr: 'الأستاذة سارة المالكي',
    nameEn: 'Ms. Sara Al-Malki',
    roleAr: 'مديرة تنفيذية',
    roleEn: 'Executive Director',
    textAr: 'الاحترافية والشفافية كانا أبرز ما لمسته في تعاملي مع الهشام. اشتريت وحدة تجارية في مركزهم وكل شيء سار بسلاسة تامة، أنصح الجميع بالتعامل معهم.',
    textEn: 'Professionalism and transparency were the most prominent aspects I experienced in dealing with AL HISHAM. I bought a commercial unit in their center and everything went completely smoothly. I recommend everyone to work with them.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b332c133?w=150&q=80',
  },
  {
    id: '3',
    nameAr: 'الدكتور خالد الحربي',
    nameEn: 'Dr. Khalid Al-Harbi',
    roleAr: 'طبيب واستثماري عقاري',
    roleEn: 'Doctor & Real Estate Investor',
    textAr: 'أفضل شركة تعاملت معها في القطاع العقاري. المشروع سُلّم في الوقت المحدد وبمواصفات تفوق ما وُعدنا به. العوائد الاستثمارية ممتازة.',
    textEn: 'The best company I have dealt with in the real estate sector. The project was delivered on time with specifications that exceeded what we were promised. Investment returns are excellent.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
  },
  {
    id: '4',
    nameAr: 'الأستاذ محمد الشهري',
    nameEn: 'Mr. Mohammed Al-Shahri',
    roleAr: 'رجل أعمال',
    roleEn: 'Businessman',
    textAr: 'استثمرت مع الهشام في مشروع الأبراج التجارية وكانت النتيجة فوق التوقعات. فريق مبيعات محترف، وعقود واضحة، والمشروع تميز عن غيره في السوق.',
    textEn: 'I invested with AL HISHAM in the commercial towers project and the result exceeded expectations. A professional sales team, clear contracts, and a project that stood out from others in the market.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
  },
];

// Blog Posts Data
export interface BlogPost {
  id: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryEn: string;
  date: string;
  readTime: string;
  image: string;
  summaryAr: string;
  summaryEn: string;
  contentAr: string;
  contentEn: string;
  author: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 'real-estate-investment-2024',
    titleAr: 'أفضل مناطق الاستثمار العقاري في السعودية 2024',
    titleEn: 'Best Real Estate Investment Areas in Saudi Arabia 2024',
    categoryAr: 'استثمار عقاري',
    categoryEn: 'Real Estate Investment',
    date: '2024-01-15',
    readTime: '5',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    summaryAr: 'دليلك الشامل للمناطق الأكثر جاذبية للاستثمار العقاري في المملكة العربية السعودية خلال عام 2024 مع تحليل السوق والفرص.',
    summaryEn: 'Your comprehensive guide to the most attractive areas for real estate investment in Saudi Arabia during 2024 with market analysis and opportunities.',
    contentAr: 'محتوى المقال الكامل هنا...',
    contentEn: 'Full article content here...',
    author: 'فريق الهشام',
  },
  {
    id: 'sustainable-development',
    titleAr: 'التطوير العقاري المستدام: مستقبل العقارات',
    titleEn: 'Sustainable Real Estate Development: The Future of Properties',
    categoryAr: 'تطوير عقاري',
    categoryEn: 'Real Estate Development',
    date: '2024-02-10',
    readTime: '7',
    image: 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&q=80',
    summaryAr: 'كيف تشكل ممارسات التطوير العقاري المستدام مستقبل القطاع العقاري وتخلق فرصاً استثمارية مميزة.',
    summaryEn: 'How sustainable real estate development practices are shaping the future of the real estate sector and creating distinctive investment opportunities.',
    contentAr: 'محتوى المقال الكامل هنا...',
    contentEn: 'Full article content here...',
    author: 'م. أحمد الهشام',
  },
  {
    id: 'tips-for-buyers',
    titleAr: '10 نصائح ذهبية لمشتري العقارات لأول مرة',
    titleEn: '10 Golden Tips for First-Time Property Buyers',
    categoryAr: 'نصائح للمستثمرين',
    categoryEn: 'Investor Tips',
    date: '2024-03-05',
    readTime: '6',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    summaryAr: 'قبل أن تتخذ قرار شراء عقارك الأول، اقرأ هذه النصائح الذهبية التي ستوفر عليك الكثير من المال والوقت والجهد.',
    summaryEn: 'Before making the decision to buy your first property, read these golden tips that will save you a lot of money, time, and effort.',
    contentAr: 'محتوى المقال الكامل هنا...',
    contentEn: 'Full article content here...',
    author: 'فريق الهشام',
  },
];

// Jobs Data
export interface Job {
  id: string;
  titleAr: string;
  titleEn: string;
  departmentAr: string;
  departmentEn: string;
  typeAr: string;
  typeEn: string;
  locationAr: string;
  locationEn: string;
  experienceAr: string;
  experienceEn: string;
  descriptionAr: string;
  descriptionEn: string;
  requirements: string[];
}

export const jobs: Job[] = [
  {
    id: 'project-manager',
    titleAr: 'مدير مشاريع',
    titleEn: 'Project Manager',
    departmentAr: 'إدارة المشاريع',
    departmentEn: 'Project Management',
    typeAr: 'دوام كامل',
    typeEn: 'Full Time',
    locationAr: 'الرياض، السعودية',
    locationEn: 'Riyadh, Saudi Arabia',
    experienceAr: '5+ سنوات',
    experienceEn: '5+ Years',
    descriptionAr: 'نبحث عن مدير مشاريع متمرس لقيادة فريقنا في تنفيذ مشاريعنا العقارية الكبرى.',
    descriptionEn: 'We are looking for an experienced project manager to lead our team in executing our major real estate projects.',
    requirements: ['شهادة هندسية أو إدارية', 'خبرة 5 سنوات في إدارة المشاريع', 'PMP أو ما يعادلها', 'مهارات قيادية ممتازة'],
  },
  {
    id: 'sales-specialist',
    titleAr: 'أخصائي مبيعات عقارية',
    titleEn: 'Real Estate Sales Specialist',
    departmentAr: 'المبيعات والتسويق',
    departmentEn: 'Sales & Marketing',
    typeAr: 'دوام كامل',
    typeEn: 'Full Time',
    locationAr: 'جدة، السعودية',
    locationEn: 'Jeddah, Saudi Arabia',
    experienceAr: '3+ سنوات',
    experienceEn: '3+ Years',
    descriptionAr: 'فرصة للانضمام إلى فريق مبيعاتنا الديناميكي وتسويق مشاريعنا العقارية الفاخرة.',
    descriptionEn: 'An opportunity to join our dynamic sales team and market our luxury real estate projects.',
    requirements: ['خبرة في المبيعات العقارية', 'مهارات تفاوض عالية', 'شبكة علاقات واسعة', 'قدرة على تحقيق الأهداف'],
  },
  {
    id: 'civil-engineer',
    titleAr: 'مهندس مدني',
    titleEn: 'Civil Engineer',
    departmentAr: 'الهندسة والتشييد',
    departmentEn: 'Engineering & Construction',
    typeAr: 'دوام كامل',
    typeEn: 'Full Time',
    locationAr: 'الدمام، السعودية',
    locationEn: 'Dammam, Saudi Arabia',
    experienceAr: '3+ سنوات',
    experienceEn: '3+ Years',
    descriptionAr: 'نحتاج مهندساً مدنياً متخصصاً للإشراف على مشاريع التشييد وضمان الجودة.',
    descriptionEn: 'We need a specialized civil engineer to supervise construction projects and ensure quality.',
    requirements: ['بكالوريوس هندسة مدنية', 'خبرة في مشاريع البناء الكبرى', 'إتقان برامج AutoCAD وRevit', 'هجرة عمل مرخصة'],
  },
];

// Partners Data
export const partners = [
  { id: 1, name: 'شريك 1', logo: 'https://via.placeholder.com/160x60/1B4332/FFFFFF?text=Partner+1' },
  { id: 2, name: 'شريك 2', logo: 'https://via.placeholder.com/160x60/1B4332/FFFFFF?text=Partner+2' },
  { id: 3, name: 'شريك 3', logo: 'https://via.placeholder.com/160x60/1B4332/FFFFFF?text=Partner+3' },
  { id: 4, name: 'شريك 4', logo: 'https://via.placeholder.com/160x60/1B4332/FFFFFF?text=Partner+4' },
  { id: 5, name: 'شريك 5', logo: 'https://via.placeholder.com/160x60/1B4332/FFFFFF?text=Partner+5' },
  { id: 6, name: 'شريك 6', logo: 'https://via.placeholder.com/160x60/1B4332/FFFFFF?text=Partner+6' },
  { id: 7, name: 'شريك 7', logo: 'https://via.placeholder.com/160x60/1B4332/FFFFFF?text=Partner+7' },
  { id: 8, name: 'شريك 8', logo: 'https://via.placeholder.com/160x60/1B4332/FFFFFF?text=Partner+8' },
];
