export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://alhisham.vercel.app';
export const SITE_NAME = 'AL HISHAM DEVELOPMENT';
export const SITE_NAME_AR = 'هشام للتطوير العقاري';
export const DEFAULT_LOGO = `${SITE_URL}/logo.png`;

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: SITE_NAME_AR,
    url: SITE_URL,
    logo: DEFAULT_LOGO,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+201103657888',
      contactType: 'customer service',
      areaServed: ['EG', 'SA', 'GCC'],
      availableLanguage: ['Arabic', 'English'],
    },
    sameAs: [
      'https://www.instagram.com/alhesham_realstate',
      'https://www.tiktok.com/@alhesham_develop',
      'https://wa.me/201103657888',
    ],
  };
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: `${SITE_NAME_AR} | ${SITE_NAME}`,
    alternateName: SITE_NAME_AR,
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    inLanguage: ['ar-EG', 'en-US'],
  };
}

export function getRealEstateAgentSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${SITE_URL}/#realestateagent`,
    name: `${SITE_NAME_AR} | ${SITE_NAME}`,
    image: DEFAULT_LOGO,
    url: SITE_URL,
    telephone: '+201103657888',
    email: 'hisham841978@gmail.com',
    priceRange: '$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'محور الأندلس، مدينة بني سويف',
      addressLocality: 'Beni Suef',
      addressCountry: 'EG',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      opens: '08:00',
      closes: '18:00',
    },
  };
}

export function getProjectSchema(project: {
  title: string;
  description: string;
  slug: string;
  location?: string;
  cover_image?: string;
  images?: string[];
  type?: string;
}) {
  const projectUrl = `${SITE_URL}/projects/${project.slug}`;
  const images = project.images && project.images.length > 0
    ? project.images
    : project.cover_image ? [project.cover_image] : [DEFAULT_LOGO];

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': `${projectUrl}/#listing`,
    name: project.title,
    description: project.description,
    url: projectUrl,
    image: images,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EGP',
      availability: 'https://schema.org/InStock',
    },
    containedInPlace: project.location ? {
      '@type': 'Place',
      name: project.location,
    } : undefined,
  };
}

export function getArticleSchema(article: {
  title: string;
  excerpt: string;
  slug: string;
  cover_image?: string;
  author?: string;
  created_at?: string;
  updated_at?: string;
}) {
  const articleUrl = `${SITE_URL}/blog/${article.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${articleUrl}/#article`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: article.title,
    description: article.excerpt,
    image: article.cover_image ? [article.cover_image] : [DEFAULT_LOGO],
    author: {
      '@type': 'Organization',
      name: article.author || SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    datePublished: article.created_at || new Date().toISOString(),
    dateModified: article.updated_at || article.created_at || new Date().toISOString(),
  };
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}
