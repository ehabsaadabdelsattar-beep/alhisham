import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye, FiEyeOff, FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import { projectsService } from '../../services/projects';
import { supabase } from '../../lib/supabase';
import type { Project } from '../../services/projects';
import { motion, AnimatePresence } from 'framer-motion';

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  under_construction: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  sold_out: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  planning: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const statusLabels: Record<string, string> = {
  completed: 'مكتمل',
  under_construction: 'قيد التنفيذ',
  upcoming: 'قريباً',
  sold_out: 'مباع',
  planning: 'تخطيط',
};

const categoryLabels: Record<string, string> = {
  residential: 'سكني',
  commercial: 'تجاري',
  mixed: 'متعدد',
};

export default function AdminProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPublished, setFilterPublished] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف "${name}"؟\nلا يمكن التراجع عن هذا الإجراء.`)) return;
    setDeletingId(id);
    try {
      await projectsService.deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
      showSuccess('تم حذف المشروع بنجاح');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('حدث خطأ أثناء الحذف. يرجى المحاولة مرة أخرى.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (project: Project) => {
    setTogglingId(project.id);
    try {
      const newVal = !project.published;
      await supabase.from('projects').update({ published: newVal }).eq('id', project.id);
      setProjects(projects.map(p => p.id === project.id ? { ...p, published: newVal } : p));
      showSuccess(newVal ? 'تم نشر المشروع بنجاح' : 'تم إخفاء المشروع من الموقع');
    } catch (err) {
      console.error('Toggle publish error:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const filtered = projects.filter(p => {
    const matchesSearch = p.title_ar.includes(searchTerm) || p.title_en.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || p.status === filterStatus;
    const matchesPublished = filterPublished === '' || (filterPublished === 'true' ? p.published : !p.published);
    return matchesSearch && matchesStatus && matchesPublished;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">إدارة المشاريع</h1>
          <p className="text-sm text-gray-500 mt-1">{projects.length} مشروع إجمالاً · {projects.filter(p => p.published).length} منشور</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchProjects}
            title="تحديث"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-dark-300 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/projects"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-dark-300 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors text-sm"
          >
            <FiExternalLink className="w-4 h-4" />
            عرض الموقع
          </Link>
          <Link
            to="/admin/projects/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-dark font-semibold text-sm hover:bg-yellow-500 transition-colors shadow-sm"
          >
            <FiPlus className="w-4 h-4" />
            إضافة مشروع
          </Link>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-medium"
          >
            ✓ {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-light rounded-xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ابحث باسم المشروع..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 pr-10 pl-4 text-dark dark:text-white focus:outline-none focus:border-gold text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 px-4 text-dark dark:text-white focus:outline-none focus:border-gold text-sm min-w-32"
          >
            <option value="">كل الحالات</option>
            <option value="upcoming">قريباً</option>
            <option value="planning">تخطيط</option>
            <option value="under_construction">قيد التنفيذ</option>
            <option value="completed">مكتمل</option>
            <option value="sold_out">مباع</option>
          </select>
          <select
            value={filterPublished}
            onChange={e => setFilterPublished(e.target.value)}
            className="bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 px-4 text-dark dark:text-white focus:outline-none focus:border-gold text-sm min-w-28"
          >
            <option value="">الكل</option>
            <option value="true">منشور</option>
            <option value="false">مسودة</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-light rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">جاري التحميل...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-300 dark:text-gray-600 mb-3">
              <FiSearch className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">لا توجد مشاريع تطابق البحث</p>
            <Link to="/admin/projects/new" className="btn-gold text-sm px-6 py-2">
              إضافة مشروع جديد
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-dark-300 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                  <th className="text-right p-4 font-semibold">المشروع</th>
                  <th className="text-right p-4 font-semibold hidden sm:table-cell">التصنيف</th>
                  <th className="text-right p-4 font-semibold hidden md:table-cell">الإنجاز</th>
                  <th className="text-right p-4 font-semibold">الحالة</th>
                  <th className="text-right p-4 font-semibold">النشر</th>
                  <th className="text-left p-4 font-semibold">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map(project => (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50 dark:hover:bg-dark-300/50 transition-colors"
                  >
                    {/* Project */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-300 flex-shrink-0">
                          {project.cover_image ? (
                            <img src={project.cover_image} alt={project.title_ar} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">لا صورة</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-dark dark:text-white text-sm truncate max-w-40">{project.title_ar}</p>
                          <p className="text-xs text-gray-400 truncate max-w-40">{project.title_en}</p>
                          <p className="text-xs text-gray-300 dark:text-gray-600 font-mono mt-0.5">{project.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4 hidden sm:table-cell">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {categoryLabels[project.category] || project.category}
                      </span>
                    </td>

                    {/* Progress */}
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gold rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 tabular-nums">{project.progress}%</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status] || 'bg-gray-100 text-gray-600'}`}>
                        {statusLabels[project.status] || project.status}
                      </span>
                    </td>

                    {/* Publish Toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => handleTogglePublish(project)}
                        disabled={togglingId === project.id}
                        title={project.published ? 'إلغاء النشر' : 'نشر المشروع'}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          project.published
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200'
                        } ${togglingId === project.id ? 'opacity-50' : ''}`}
                      >
                        {togglingId === project.id ? (
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : project.published ? (
                          <FiEye className="w-3 h-3" />
                        ) : (
                          <FiEyeOff className="w-3 h-3" />
                        )}
                        {project.published ? 'منشور' : 'مسودة'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        <a
                          href={`/projects/${project.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="معاينة في الموقع"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-500 hover:text-gold hover:bg-gold/10 transition-colors"
                        >
                          <FiExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <Link
                          to={`/admin/projects/edit/${project.id}`}
                          title="تعديل"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(project.id, project.title_ar)}
                          disabled={deletingId === project.id}
                          title="حذف"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {deletingId === project.id ? (
                            <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FiTrash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
            يعرض {filtered.length} من {projects.length} مشروع
          </div>
        )}
      </div>
    </div>
  );
}
