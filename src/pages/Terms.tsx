import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>الشروط والأحكام | الهشام للتطوير العقاري</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="pt-32 pb-20 bg-surface dark:bg-dark-200 min-h-screen">
        <div className="container-custom max-w-4xl">
          <div className="bg-white dark:bg-dark-300 p-8 md:p-12 shadow-sm border border-gray-100 dark:border-dark-400">
            <h1 className="text-3xl font-bold text-dark dark:text-white mb-6">الشروط والأحكام</h1>
            <div className="gold-divider mb-8" />
            
            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-6 leading-relaxed">
              <p>مرحباً بك في موقع الهشام للتطوير العقاري. باستخدامك لهذا الموقع، فإنك توافق على الالتزام بالشروط والأحكام التالية:</p>
              
              <h3 className="text-xl font-bold text-dark dark:text-white mt-8 mb-4">1. حقوق الملكية الفكرية</h3>
              <p>جميع المحتويات الموجودة على هذا الموقع، بما في ذلك النصوص والرسومات والشعارات والصور والتصاميم، هي ملك لشركة الهشام للتطوير العقاري ومحمية بموجب قوانين حقوق النشر.</p>

              <h3 className="text-xl font-bold text-dark dark:text-white mt-8 mb-4">2. دقة المعلومات</h3>
              <p>نسعى جاهدين لتوفير معلومات دقيقة ومحدثة عن مشاريعنا، ولكننا لا نقدم أي ضمانات صريحة أو ضمنية بشأن دقة أو اكتمال هذه المعلومات. الصور والمخططات المعروضة هي لأغراض توضيحية وقد تختلف عن الواقع.</p>

              <h3 className="text-xl font-bold text-dark dark:text-white mt-8 mb-4">3. إخلاء المسؤولية</h3>
              <p>الشركة غير مسؤولة عن أي أضرار مباشرة أو غير مباشرة تنشأ عن استخدام هذا الموقع أو الاعتماد على المعلومات الواردة فيه.</p>

              <h3 className="text-xl font-bold text-dark dark:text-white mt-8 mb-4">4. التعديلات</h3>
              <p>نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت دون إشعار مسبق. يعتبر استمرارك في استخدام الموقع بعد أي تعديلات بمثابة قبول لهذه التعديلات.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
