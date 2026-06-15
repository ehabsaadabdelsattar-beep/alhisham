import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>الصفحة غير موجودة | الهشام للتطوير العقاري</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center bg-surface dark:bg-dark-200 section-padding">
        <div className="text-center max-w-lg mx-auto">
          <div className="text-9xl font-bold text-gold mb-6 font-english select-none">404</div>
          <h1 className="text-3xl font-bold text-dark dark:text-white mb-4">عذراً، الصفحة غير موجودة</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            يبدو أن الصفحة التي تبحث عنها قد تم نقلها أو حذفها، أو أن الرابط غير صحيح.
          </p>
          <Link to="/" className="btn-primary inline-flex">
            <svg className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </>
  );
}
