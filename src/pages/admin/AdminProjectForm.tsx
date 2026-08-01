import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { projectsService } from '../../services/projects';
import type { Project } from '../../services/projects';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSave, FiArrowRight, FiUpload, FiTrash2, FiEye, FiEyeOff,
  FiStar, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';

const INITIAL_STATE: Partial<Project> = {
  title_ar: '', title_en: '', slug: '',
  description_ar: '', description_en: '',
  category: 'residential', status: 'upcoming',
  progress: 0, area: '', units: 0,
  location_ar: '', location_en: '',
  address_ar: '', address_en: '',
  google_maps_url: '',
  price_from: undefined, price_to: undefined,
  seo_title: '', seo_description: '',
  featured: false, published: true,
};

export default function AdminProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<Partial<Project>>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'media' | 'seo'>('basic');

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) setFormData(data);
    } catch (error) {
      console.error('Error fetching project', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Auto-generate slug from English title
  const handleTitleEnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      title_en: val,
      ...(!isEdit || !prev.slug ? {
        slug: val.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
      } : {})
    }));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'حجم الصورة يجب أن يكون أقل من 10 ميغابايت.' });
      return;
    }
    try {
      setUploadingCover(true);
      setMsg(null);
      const fileExt = file.name.split('.').pop();
      const filePath = `projects/${Date.now()}-cover.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, cover_image: data.publicUrl }));
      setMsg({ type: 'success', text: 'تم رفع صورة الغلاف بنجاح.' });
    } catch (error: any) {
      setMsg({ type: 'error', text: 'خطأ في رفع الصورة: ' + error.message });
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_ar?.trim() || !formData.title_en?.trim() || !formData.slug?.trim()) {
      setMsg({ type: 'error', text: 'يرجى ملء الحقول الإلزامية: الاسم بالعربية والإنجليزية والرابط الدائم.' });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      if (isEdit) {
        await projectsService.updateProject(id!, formData);
        setMsg({ type: 'success', text: 'تم تحديث المشروع بنجاح! ✓' });
      } else {
        await projectsService.createProject(formData);
        setMsg({ type: 'success', text: 'تم إضافة المشروع بنجاح! سيظهر في الموقع فوراً.' });
        setTimeout(() => navigate('/admin/projects'), 1500);
      }
    } catch (error: any) {
      const errMsg = error.message || 'خطأ في حفظ المشروع';
      if (errMsg.includes('duplicate') || errMsg.includes('unique')) {
        setMsg({ type: 'error', text: 'هذا الرابط الدائم (Slug) مستخدم بالفعل. يرجى استخدام رابط مختلف.' });
      } else {
        setMsg({ type: 'error', text: 'خطأ في الحفظ: ' + errMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  const InputClass = 'w-full bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-dark dark:text-white focus:outline-none focus:border-gold text-sm transition-colors';
  const LabelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

  const tabs = [
    { key: 'basic', label: 'المعلومات الأساسية' },
    { key: 'details', label: 'التفاصيل والموقع' },
    { key: 'media', label: 'الوسائط' },
    { key: 'seo', label: 'إعدادات SEO' },
  ] as const;

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/projects"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-dark-300 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <FiArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-dark dark:text-white">
              {isEdit ? 'تعديل المشروع' : 'إضافة مشروع جديد'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEdit ? `تعديل: ${formData.title_ar}` : 'سيظهر المشروع في الموقع فور نشره'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEdit && formData.slug && (
            <a
              href={`/projects/${formData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-dark-300 text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-200 transition-colors"
            >
              <FiEye className="w-4 h-4" />
              معاينة
            </a>
          )}
        </div>
      </div>

      {/* Message */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${
              msg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
            }`}
          >
            {msg.type === 'success' ? <FiCheckCircle className="w-4 h-4 flex-shrink-0" /> : <FiAlertCircle className="w-4 h-4 flex-shrink-0" />}
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-dark-300 p-1 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-dark-light text-dark dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-dark dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== TAB: BASIC ===== */}
        {activeTab === 'basic' && (
          <div className="bg-white dark:bg-dark-light rounded-xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={LabelClass}>اسم المشروع (عربي) <span className="text-red-500">*</span></label>
                <input required type="text" name="title_ar" value={formData.title_ar || ''} onChange={handleChange} className={InputClass} placeholder="مثال: مشروع النخيل" dir="rtl" />
              </div>
              <div>
                <label className={LabelClass}>اسم المشروع (English) <span className="text-red-500">*</span></label>
                <input required type="text" name="title_en" value={formData.title_en || ''} onChange={handleTitleEnChange} className={InputClass} placeholder="e.g. Nakheel Project" dir="ltr" />
              </div>
              <div>
                <label className={LabelClass}>الرابط الدائم (Slug) <span className="text-red-500">*</span></label>
                <input required type="text" name="slug" value={formData.slug || ''} onChange={handleChange} className={`${InputClass} font-mono`} placeholder="nakheel-project" dir="ltr" />
                <p className="mt-1 text-xs text-gray-400">سيظهر في رابط المشروع: /projects/<strong>{formData.slug || 'slug'}</strong></p>
              </div>
              <div>
                <label className={LabelClass}>التصنيف</label>
                <select name="category" value={formData.category || 'residential'} onChange={handleChange} className={InputClass}>
                  <option value="residential">سكني</option>
                  <option value="commercial">تجاري</option>
                  <option value="mixed">متعدد الاستخدامات</option>
                </select>
              </div>
              <div>
                <label className={LabelClass}>الحالة</label>
                <select name="status" value={formData.status || 'upcoming'} onChange={handleChange} className={InputClass}>
                  <option value="upcoming">قريباً</option>
                  <option value="planning">قيد التخطيط</option>
                  <option value="under_construction">قيد التنفيذ</option>
                  <option value="completed">مكتمل</option>
                  <option value="sold_out">مباع بالكامل</option>
                </select>
              </div>
              <div>
                <label className={LabelClass}>نسبة الإنجاز (%)</label>
                <input type="number" min="0" max="100" name="progress" value={formData.progress ?? 0} onChange={handleChange} className={InputClass} />
                <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${formData.progress || 0}%` }} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={LabelClass}>الوصف (عربي)</label>
                <textarea rows={4} name="description_ar" value={formData.description_ar || ''} onChange={handleChange} className={InputClass} dir="rtl" placeholder="وصف تفصيلي للمشروع بالعربية..." />
              </div>
              <div className="md:col-span-2">
                <label className={LabelClass}>الوصف (English)</label>
                <textarea rows={4} name="description_en" value={formData.description_en || ''} onChange={handleChange} className={InputClass} dir="ltr" placeholder="Detailed project description in English..." />
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${formData.published ? 'bg-gold' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <input type="checkbox" name="published" checked={!!formData.published} onChange={handleChange} className="sr-only" />
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${formData.published ? 'left-6' : 'left-1'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark dark:text-white">نشر المشروع</p>
                    <p className="text-xs text-gray-400">{formData.published ? 'يظهر في الموقع' : 'مخفي (مسودة)'}</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${formData.featured ? 'bg-gold' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <input type="checkbox" name="featured" checked={!!formData.featured} onChange={handleChange} className="sr-only" />
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${formData.featured ? 'left-6' : 'left-1'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark dark:text-white flex items-center gap-1"><FiStar className="w-3.5 h-3.5 text-gold" /> مشروع مميز</p>
                    <p className="text-xs text-gray-400">يظهر في الصفحة الرئيسية</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: DETAILS ===== */}
        {activeTab === 'details' && (
          <div className="bg-white dark:bg-dark-light rounded-xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={LabelClass}>الموقع (عربي)</label>
                <input type="text" name="location_ar" value={formData.location_ar || ''} onChange={handleChange} className={InputClass} placeholder="مثال: القاهرة الجديدة" dir="rtl" />
              </div>
              <div>
                <label className={LabelClass}>الموقع (English)</label>
                <input type="text" name="location_en" value={formData.location_en || ''} onChange={handleChange} className={InputClass} placeholder="e.g. New Cairo" dir="ltr" />
              </div>
              <div>
                <label className={LabelClass}>العنوان التفصيلي (عربي)</label>
                <input type="text" name="address_ar" value={formData.address_ar || ''} onChange={handleChange} className={InputClass} dir="rtl" />
              </div>
              <div>
                <label className={LabelClass}>العنوان التفصيلي (English)</label>
                <input type="text" name="address_en" value={formData.address_en || ''} onChange={handleChange} className={InputClass} dir="ltr" />
              </div>
              <div>
                <label className={LabelClass}>المساحة (area)</label>
                <input type="text" name="area" value={formData.area || ''} onChange={handleChange} className={InputClass} placeholder="مثال: 50,000 م²" />
              </div>
              <div>
                <label className={LabelClass}>عدد الوحدات</label>
                <input type="number" name="units" value={formData.units ?? 0} onChange={handleChange} className={InputClass} min="0" />
              </div>
              <div>
                <label className={LabelClass}>السعر من (جنيه)</label>
                <input type="number" name="price_from" value={formData.price_from ?? ''} onChange={handleChange} className={InputClass} placeholder="مثال: 1500000" dir="ltr" />
              </div>
              <div>
                <label className={LabelClass}>السعر إلى (جنيه)</label>
                <input type="number" name="price_to" value={formData.price_to ?? ''} onChange={handleChange} className={InputClass} placeholder="مثال: 5000000" dir="ltr" />
              </div>
              <div>
                <label className={LabelClass}>تاريخ البدء</label>
                <input type="date" name="start_date" value={formData.start_date || ''} onChange={handleChange} className={InputClass} dir="ltr" />
              </div>
              <div>
                <label className={LabelClass}>تاريخ الإنجاز المتوقع</label>
                <input type="date" name="completion_date" value={formData.completion_date || ''} onChange={handleChange} className={InputClass} dir="ltr" />
              </div>
              <div className="md:col-span-2">
                <label className={LabelClass}>رابط خرائط جوجل</label>
                <input type="url" name="google_maps_url" value={formData.google_maps_url || ''} onChange={handleChange} className={InputClass} placeholder="https://maps.google.com/..." dir="ltr" />
              </div>
              <div className="md:col-span-2">
                <label className={LabelClass}>رابط فيديو المشروع (YouTube / Vimeo)</label>
                <input type="url" name="video_url" value={formData.video_url || ''} onChange={handleChange} className={InputClass} placeholder="https://youtube.com/watch?v=..." dir="ltr" />
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: MEDIA ===== */}
        {activeTab === 'media' && (
          <div className="bg-white dark:bg-dark-light rounded-xl border border-gray-100 dark:border-gray-800 p-6 space-y-6">
            <div>
              <label className={LabelClass}>صورة الغلاف (Cover Image)</label>
              <div className="flex gap-4 items-start">
                <label className={`flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploadingCover ? 'border-gold bg-gold/5' : 'border-gray-200 dark:border-gray-700 hover:border-gold hover:bg-gold/5'}`}>
                  {uploadingCover ? (
                    <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiUpload className="w-8 h-8 text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500">اضغط لرفع صورة الغلاف</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP — حد أقصى 10 ميغابايت</p>
                    </>
                  )}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverUpload} className="hidden" disabled={uploadingCover} />
                </label>
                {formData.cover_image && (
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <img src={formData.cover_image} alt="Cover" className="w-full h-full object-cover rounded-xl border border-gray-200 dark:border-gray-700" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, cover_image: undefined }))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              {formData.cover_image && (
                <div className="mt-3">
                  <label className={LabelClass}>رابط صورة الغلاف (URL مباشر)</label>
                  <input type="url" name="cover_image" value={formData.cover_image || ''} onChange={handleChange} className={`${InputClass} font-mono text-xs`} dir="ltr" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== TAB: SEO ===== */}
        {activeTab === 'seo' && (
          <div className="bg-white dark:bg-dark-light rounded-xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-400">
              إعدادات SEO اختيارية. إذا تركتها فارغة، سيتم استخدام اسم ووصف المشروع تلقائياً.
            </div>
            <div>
              <label className={LabelClass}>عنوان SEO (Title Tag)</label>
              <input type="text" name="seo_title" value={formData.seo_title || ''} onChange={handleChange} className={InputClass} placeholder={formData.title_ar ? `${formData.title_ar} | هشام للتطوير العقاري` : 'عنوان صفحة المشروع في محركات البحث'} />
              <p className="mt-1 text-xs text-gray-400">{(formData.seo_title || '').length}/60 حرف (الموصى به: 50-60)</p>
            </div>
            <div>
              <label className={LabelClass}>وصف SEO (Meta Description)</label>
              <textarea rows={3} name="seo_description" value={formData.seo_description || ''} onChange={handleChange} className={InputClass} placeholder="وصف مختصر يظهر في نتائج البحث (150-160 حرف)" />
              <p className="mt-1 text-xs text-gray-400">{(formData.seo_description || '').length}/160 حرف (الموصى به: 150-160)</p>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate('/admin/projects')}
            className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
          <div className="flex gap-2">
            {activeTab !== 'basic' && (
              <button
                type="button"
                onClick={() => {
                  const order = ['basic', 'details', 'media', 'seo'];
                  const idx = order.indexOf(activeTab);
                  if (idx > 0) setActiveTab(order[idx - 1] as typeof activeTab);
                }}
                className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-colors"
              >
                السابق
              </button>
            )}
            {activeTab !== 'seo' ? (
              <button
                type="button"
                onClick={() => {
                  const order = ['basic', 'details', 'media', 'seo'];
                  const idx = order.indexOf(activeTab);
                  if (idx < order.length - 1) setActiveTab(order[idx + 1] as typeof activeTab);
                }}
                className="px-6 py-2.5 rounded-lg bg-gray-800 dark:bg-dark-300 text-white dark:text-white text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                التالي
              </button>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-gold text-dark font-semibold text-sm hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-dark/20 border-t-dark rounded-full animate-spin" />
              ) : (
                <FiSave className="w-4 h-4" />
              )}
              {loading ? 'جاري الحفظ...' : isEdit ? 'حفظ التغييرات' : 'نشر المشروع'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
