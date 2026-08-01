import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  ALL_ROLES, STAFF_ROLES, getRoleLabel, type AppRole,
} from '../../lib/permissions';
import {
  FiUsers, FiSearch, FiShield, FiMail, FiPhone, FiCalendar,
  FiCheckCircle, FiAlertCircle, FiRefreshCw, FiUserPlus, FiActivity, FiKey
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: AppRole;
  is_active?: boolean;
  is_staff?: boolean;
  department?: string | null;
  created_at: string;
  updated_at: string;
}

function getInitials(name: string | null): string {
  if (!name) return 'U';
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
}

export default function AdminUsers() {
  const { profile: me, hasPermission } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    full_name: '', email: '', phone: '', password: '', role: 'customer_service_agent' as AppRole, department: '',
  });
  const [creating, setCreating] = useState(false);
  const [activityUser, setActivityUser] = useState<UserProfile | null>(null);
  const [activity, setActivity] = useState<any[]>([]);

  const canChangeRole = hasPermission('users.change_role') || me?.role === 'admin';
  const canCreate = hasPermission('users.create') || me?.role === 'admin';
  const canEdit = hasPermission('users.edit') || me?.role === 'admin';
  const canManagePerms = hasPermission('users.manage_permissions') || me?.role === 'admin';

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data as UserProfile[]);
    } catch (err: any) {
      showToast('error', 'فشل تحميل قائمة المستخدمين: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRoleChange = async (userId: string, newRole: AppRole, userName: string) => {
    if (!canChangeRole) {
      showToast('error', 'ليس لديك صلاحية تغيير الأدوار');
      return;
    }
    if (userId === me?.id) {
      showToast('error', 'لا يمكنك تغيير دورك بنفسك');
      return;
    }
    if (newRole === 'admin' && me?.role !== 'admin') {
      showToast('error', 'فقط Super Admin يمكنه تعيين دور admin');
      return;
    }
    if (!window.confirm(`تغيير صلاحية "${userName || 'المستخدم'}" إلى [${getRoleLabel(newRole)}]؟`)) return;

    setUpdatingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, is_staff: STAFF_ROLES.includes(newRole) })
        .eq('id', userId);
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole, is_staff: STAFF_ROLES.includes(newRole) } : u));
      showToast('success', `تم تحديث صلاحية ${userName || 'المستخدم'} بنجاح`);
    } catch (err: any) {
      showToast('error', 'حدث خطأ أثناء تغيير الصلاحية: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const createEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;
    if (createForm.role === 'admin' && me?.role !== 'admin') {
      showToast('error', 'فقط Super Admin يمكنه إنشاء حساب admin');
      return;
    }
    setCreating(true);
    try {
      // Safe path: assign role to an already-registered profile (no Auth Admin key in browser)
      const { data: existing, error: findErr } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('email', createForm.email.trim())
        .maybeSingle();
      if (findErr) throw findErr;

      if (!existing) {
        showToast(
          'error',
          'لا يوجد حساب بهذا البريد. اطلب من الموظف التسجيل عبر /register أولاً، ثم عيّن الدور من هنا. (إنشاء Auth مباشرة يتطلب Service Role من الخادم فقط)'
        );
        return;
      }

      const { error: upErr } = await supabase.from('profiles').update({
        full_name: createForm.full_name.trim() || undefined,
        phone: createForm.phone.trim() || null,
        role: createForm.role,
        department: createForm.department.trim() || null,
        is_active: true,
        is_staff: STAFF_ROLES.includes(createForm.role),
      }).eq('id', existing.id);
      if (upErr) throw upErr;

      showToast('success', 'تم تعيين الموظف والدور بنجاح');
      setShowCreate(false);
      setCreateForm({ full_name: '', email: '', phone: '', password: '', role: 'customer_service_agent', department: '' });
      fetchUsers();
    } catch (err: any) {
      showToast('error', err.message || 'فشل إنشاء الموظف');
    } finally {
      setCreating(false);
    }
  };

  const openActivity = async (user: UserProfile) => {
    setActivityUser(user);
    const { data } = await supabase
      .from('activity_logs')
      .select('id, action, entity, entity_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);
    setActivity(data || []);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone || '').includes(searchTerm);
    const matchesRole = !filterRole || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white flex items-center gap-2">
            <FiUsers className="text-gold" />
            إدارة المستخدمين والفريق
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            إجمالي الحسابات: {users.length} مستخدم
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors text-sm">
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
          {canCreate && (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-dark font-semibold text-sm hover:bg-gold/90">
              <FiUserPlus className="w-4 h-4" /> موظف جديد
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-600 border-red-200'
            }`}
          >
            {toast.type === 'success' ? <FiCheckCircle className="w-5 h-5" /> : <FiAlertCircle className="w-5 h-5" />}
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-dark-light p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="ابحث بالاسم، البريد، أو الهاتف..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 pr-10 pl-4 text-dark dark:text-white focus:outline-none focus:border-gold text-sm"
          />
        </div>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 px-4 text-dark dark:text-white focus:outline-none focus:border-gold text-sm"
        >
          <option value="">جميع الأدوار</option>
          {ALL_ROLES.map(r => (
            <option key={r} value={r}>{getRoleLabel(r)}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-dark-light rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">جاري تحميل المستخدمين...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">لا يوجد مستخدمون يطابقون خيارات البحث.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 dark:bg-dark-300 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="p-4 font-semibold">المستخدم</th>
                  <th className="p-4 font-semibold">التواصل</th>
                  <th className="p-4 font-semibold">الدور</th>
                  <th className="p-4 font-semibold">الحالة</th>
                  <th className="p-4 font-semibold">التسجيل</th>
                  <th className="p-4 font-semibold text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-300/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary to-gold flex items-center justify-center text-white font-bold text-sm">
                          {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(user.full_name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-dark dark:text-white text-sm truncate">{user.full_name || 'بدون اسم'}</p>
                          <p className="text-xs text-gray-400 truncate">{user.department || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300" dir="ltr">
                          <FiMail className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate max-w-[180px]">{user.email || '—'}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500" dir="ltr">
                            <FiPhone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {canChangeRole && user.id !== me?.id ? (
                        <select
                          value={user.role}
                          disabled={updatingId === user.id}
                          onChange={e => handleRoleChange(user.id, e.target.value as AppRole, user.full_name || '')}
                          className="bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-1.5 px-3 text-xs font-medium text-dark dark:text-white focus:outline-none focus:border-gold disabled:opacity-50 max-w-[200px]"
                        >
                          {ALL_ROLES.filter(r => r !== 'admin' || me?.role === 'admin').map(r => (
                            <option key={r} value={r}>{getRoleLabel(r)}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border border-gold/30 bg-gold/10 text-gold">
                          <FiShield className="w-3 h-3" />
                          {getRoleLabel(user.role)}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${user.is_active === false ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {user.is_active === false ? 'معطّل' : 'نشط'}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <FiCalendar className="w-3.5 h-3.5" />
                        {new Date(user.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openActivity(user)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-300" title="النشاط">
                          <FiActivity className="w-4 h-4" />
                        </button>
                        {canManagePerms && (
                          <Link to={`/admin/permissions?user=${user.id}`} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-300" title="الصلاحيات">
                            <FiKey className="w-4 h-4" />
                          </Link>
                        )}
                        {canEdit && user.id !== me?.id && (
                          <button
                            disabled={updatingId === user.id}
                            onClick={async () => {
                              const newActive = user.is_active === false;
                              setUpdatingId(user.id);
                              try {
                                const { error } = await supabase.from('profiles').update({ is_active: newActive }).eq('id', user.id);
                                if (error) throw error;
                                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newActive } : u));
                                showToast('success', newActive ? 'تم تفعيل المستخدم' : 'تم تعطيل المستخدم');
                              } catch (err: any) {
                                showToast('error', err.message || 'فشل التحديث');
                              } finally {
                                setUpdatingId(null);
                              }
                            }}
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                          >
                            {user.is_active === false ? 'تفعيل' : 'تعطيل'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create employee modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.form
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onSubmit={createEmployee}
              className="bg-white dark:bg-dark-light rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl"
            >
              <h2 className="text-lg font-bold text-dark dark:text-white">تعيين موظف / دور</h2>
              <p className="text-xs text-gray-500">يجب أن يكون الحساب مسجلاً مسبقاً عبر /register. ثم عيّن الدور والصلاحيات هنا.</p>
              <input required placeholder="الاسم بالكامل" value={createForm.full_name} onChange={e => setCreateForm({ ...createForm, full_name: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50 dark:bg-dark border-gray-200 dark:border-gray-700" />
              <input required type="email" placeholder="البريد الإلكتروني (مسجّل مسبقاً)" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50 dark:bg-dark border-gray-200 dark:border-gray-700" />
              <input placeholder="الهاتف" value={createForm.phone} onChange={e => setCreateForm({ ...createForm, phone: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50 dark:bg-dark border-gray-200 dark:border-gray-700" />
              <select value={createForm.role} onChange={e => setCreateForm({ ...createForm, role: e.target.value as AppRole })} className="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50 dark:bg-dark border-gray-200 dark:border-gray-700">
                {STAFF_ROLES.filter(r => r !== 'admin' || me?.role === 'admin').map(r => (
                  <option key={r} value={r}>{getRoleLabel(r)}</option>
                ))}
              </select>
              <input placeholder="القسم (اختياري)" value={createForm.department} onChange={e => setCreateForm({ ...createForm, department: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50 dark:bg-dark border-gray-200 dark:border-gray-700" />
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm rounded-lg border">إلغاء</button>
                <button type="submit" disabled={creating} className="px-4 py-2 text-sm rounded-lg bg-gold text-dark font-semibold disabled:opacity-50">
                  {creating ? 'جاري الحفظ...' : 'تعيين الدور'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity drawer */}
      <AnimatePresence>
        {activityUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-start bg-black/40" onClick={() => setActivityUser(null)}>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md h-full bg-white dark:bg-dark-light p-6 overflow-y-auto shadow-xl"
            >
              <h3 className="font-bold text-lg mb-1">نشاط {activityUser.full_name}</h3>
              <p className="text-xs text-gray-400 mb-4">{activityUser.email}</p>
              {activity.length === 0 ? (
                <p className="text-sm text-gray-400">No activity yet.</p>
              ) : (
                <ul className="space-y-3">
                  {activity.map(a => (
                    <li key={a.id} className="text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                      <p className="font-medium text-dark dark:text-white">{a.action} — {a.entity}</p>
                      <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleString('ar-EG')}</p>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
