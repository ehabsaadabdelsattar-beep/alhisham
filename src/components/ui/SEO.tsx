import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_URL, SITE_NAME, SITE_NAME_AR, DEFAULT_LOGO } from '../../lib/schema';
import { useSettings } from '../../context/SettingsContext';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  pathname?: string;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  schemas?: Record<string, unknown>[];
  schema?: Record<string, unknown>;
}

export default function SEO({
  title,
  description,
  keywords,
  image,
  pathname = '',
  type = 'website',
  noindex = false,
  schemas = [],
  schema,
}: SEOProps) {
  const { settings } = useSettings();

  const siteUrl = (import.meta.env.VITE_SITE_URL || SITE_URL).replace(/\/$/, '');
  const cleanPathname = pathname ? (pathname.startsWith('/') ? pathname : `/${pathname}`) : '';
  const canonicalUrl = `${siteUrl}${cleanPathname}`;

  // Fallbacks from Settings or Defaults
  const defaultTitle = settings?.site_title || `${SITE_NAME_AR} | ${SITE_NAME}`;
  const pageTitle = title
    ? (title.includes(SITE_NAME_AR) || title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME_AR}`)
    : defaultTitle;

  const defaultDescription =
    settings?.site_description ||
    'هشام للتطوير العقاري – شركة تطوير عقاري متخصصة في إنشاء وتطوير مشاريع عقارية متميزة، تجمع بين الرؤية الاستثمارية والجودة لصناعة قيمة عقارية مستدامة.';
  const pageDescription = description || defaultDescription;

  const defaultKeywords = [
    'هشام للتطوير العقاري',
    'شركة هشام للتطوير العقاري',
    'التطوير العقاري',
    'شركات التطوير العقاري',
    'مشاريع عقارية',
    'مشاريع سكنية',
    'مشاريع استثمارية',
    'استثمار عقاري',
    'مشاريع عقارية في مصر',
    'أفضل شركات التطوير العقاري',
    'AL HISHAM DEVELOPMENT',
  ];
  const pageKeywords = keywords && keywords.length > 0 ? keywords.join(', ') : defaultKeywords.join(', ');

  const ogImage = image
    ? (image.startsWith('http') ? image : `${siteUrl}${image.startsWith('/') ? image : `/${image}`}`)
    : (settings?.og_image || `${siteUrl}/logo.png`);

  const googleVerification = settings?.google_verification_code || import.meta.env.VITE_GOOGLE_SITE_VERIFICATION;

  const allSchemas = [...schemas];
  if (schema) allSchemas.push(schema);

  return (
    <Helmet>
      {/* Title */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots Directive */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Google Site Verification Code */}
      {googleVerification && <meta name="google-site-verification" content={googleVerification} />}

      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME_AR} />
      <meta property="og:locale" content="ar_EG" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Schemas */}
      {allSchemas.map((s, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
}
