import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLang } from '../context/LanguageContext';

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>سياسة الخصوصية | الهشام للتطوير العقاري</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="pt-32 pb-20 bg-surface dark:bg-dark-200 min-h-screen">
        <div className="container-custom max-w-4xl">
          <div className="bg-white dark:bg-dark-300 p-8 md:p-12 shadow-sm border border-gray-100 dark:border-dark-400">
            <h1 className="text-3xl font-bold text-dark dark:text-white mb-6">سياسة الخصوصية</h1>
            <div className="gold-divider mb-8" />
            
            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-6 leading-relaxed">
              <p>نحن في الهشام للتطوير العقاري نلتزم بحماية خصوصيتك وضمان سرية معلوماتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك.</p>
              
              <h3 className="text-xl font-bold text-dark dark:text-white mt-8 mb-4">المعلومات التي نجمعها</h3>
              <p>قد نجمع المعلومات الشخصية التي تقدمها لنا طواعية عند:</p>
              <ul className="list-disc list-inside space-y-2 rtl:pr-4 ltr:pl-4">
                <li>الاستفسار عن مشاريعنا عبر الموقع أو الهاتف أو واتساب</li>
                <li>التسجيل في النشرة الإخبارية</li>
                <li>التقدم لوظيفة من خلال موقعنا</li>
              </ul>

              <h3 className="text-xl font-bold text-dark dark:text-white mt-8 mb-4">كيفية استخدام المعلومات</h3>
              <p>نستخدم معلوماتك الشخصية للأغراض التالية:</p>
              <ul className="list-disc list-inside space-y-2 rtl:pr-4 ltr:pl-4">
                <li>الرد على استفساراتك وتقديم الخدمات المطلوبة</li>
                <li>إرسال تحديثات حول مشاريعنا الجديدة (إذا وافقت على ذلك)</li>
                <li>تحسين تجربة المستخدم على موقعنا</li>
              </ul>

              <h3 className="text-xl font-bold text-dark dark:text-white mt-8 mb-4">حماية المعلومات</h3>
              <p>نتخذ التدابير الأمنية المناسبة لحماية معلوماتك من الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف. نحن لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
