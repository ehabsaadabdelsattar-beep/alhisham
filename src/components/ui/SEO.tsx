import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: Record<string, unknown>;
}

export default function SEO({
  title,
  description,
  image = '/logo.png',
  url = '',
  type = 'website',
  schema,
}: SEOProps) {
  const siteUrl = 'https://alhishamdevelopment.com';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullTitle = `${title} | الهشام للتطوير العقاري - AL HISHAM DEVELOPMENT`;

  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'AL HISHAM DEVELOPMENT - الهشام للتطوير العقاري',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'شركة الهشام للتطوير العقاري — رؤية استراتيجية وخبرة محلية عميقة تصنع مشاريع عقارية تدوم للأجيال القادمة.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'محور الأندلس',
      addressLocality: 'بني سويف',
      addressCountry: 'EG',
    },
    telephone: '+201103657888',
    email: 'hisham841978@gmail.com',
    sameAs: [
      'https://www.instagram.com/alhesham_realstate',
      'https://www.tiktok.com/@alhesham_develop',
    ],
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image.startsWith('http') ? image : `${siteUrl}${image}`} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="AL HISHAM DEVELOPMENT" />
      <meta property="og:locale" content="ar_EG" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image.startsWith('http') ? image : `${siteUrl}${image}`} />

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(schema || defaultSchema)}
      </script>
    </Helmet>
  );
}
