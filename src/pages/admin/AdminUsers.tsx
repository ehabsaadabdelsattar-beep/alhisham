import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FiUsers, FiSearch, FiShield, FiUserCheck, FiMail, FiPhone, FiCalendar, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'admin' | 'editor' | 'investor' | 'customer';
  created_at: string;
  updated_at: string;
}

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  editor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  investor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  customer: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
};

const roleLabels: Record<string, string> = {
  admin: 'مدير النظام (Admin)',
  editor: 'محرر (Editor)',
  investor: 'مستثمر (Investor)',
  customer: 'عميل (Customer)',
};

function getInitials(name: string | null): string {
  if (!name) return 'U';
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

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
      console.error('Error fetching users:', err);
      showToast('error', 'فشل تحميل قائمة المستخدمين: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'editor' | 'investor' | 'customer', userName: string) => {
    if (!window.confirm(`هل أنت متأكد من تغيير صلاحية "${userName || 'المستخدم'}" إلى [${roleLabels[newRole]}]؟`)) {
      return;
    }

    setUpdatingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showToast('success', `تم تحديث صلاحية ${userName || 'المستخدم'} بنجاح!`);
    } catch (err: any) {
      console.error('Role update error:', err);
      showToast('error', 'حدث خطأ أثناء تغيير الصلاحية: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white flex items-center gap-2">
            <FiUsers className="text-gold" />
            إدارة المستخدمين والحسابات
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            إجمالي الحسابات المسجلة: {users.length} مستخدم
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors text-sm"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث القائمة
        </button>
      </div>

      {/* Toast alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
            }`}
          >
            {toast.type === 'success' ? <FiCheckCircle className="w-5 h-5 flex-shrink-0" /> : <FiAlertCircle className="w-5 h-5 flex-shrink-0" />}
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-light p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="ابحث بالاسم، البريد الإلكتروني، أو رقم الهاتف..."
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
          <option value="">جميع الصلاحيات (Roles)</option>
          <option value="admin">مدير نظام (Admin)</option>
          <option value="editor">محرر (Editor)</option>
          <option value="investor">مستثمر (Investor)</option>
          <option value="customer">عميل (Customer)</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-dark-light rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">جاري تحميل المستخدمين...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            لا يوجد مستخدمون يطابقون خيارات البحث.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 dark:bg-dark-300 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="p-4 font-semibold">المستخدم</th>
                  <th className="p-4 font-semibold">البريد والهاتف</th>
                  <th className="p-4 font-semibold">الصلاحية (Role)</th>
                  <th className="p-4 font-semibold">تاريخ التسجيل</th>
                  <th className="p-4 font-semibold text-left">تغيير الصلاحية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-300/50 transition-colors">
                    {/* User Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary to-gold flex items-center justify-center text-white font-bold text-sm ring-2 ring-gold/20">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name || 'User'} className="w-full h-full object-cover" />
                          ) : (
                            getInitials(user.full_name)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-dark dark:text-white text-sm truncate">
                            {user.full_name || 'بدون اسم'}
                          </p>
                          <p className="text-xs text-gray-400 font-mono truncate">{user.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300" dir="ltr">
                          <FiMail className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate max-w-[200px]">{user.email || 'غير متاح'}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500" dir="ltr">
                            <FiPhone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${roleColors[user.role] || roleColors.customer}`}>
                        <FiShield className="w-3 h-3" />
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <FiCalendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {new Date(user.created_at).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Action: Change Role */}
                    <td className="p-4">
                      <div className="flex items-center justify-end">
                        <select
                          value={user.role}
                          disabled={updatingId === user.id}
                          onChange={e => handleRoleChange(user.id, e.target.value as any, user.full_name || '')}
                          className="bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-1.5 px-3 text-xs font-medium text-dark dark:text-white focus:outline-none focus:border-gold disabled:opacity-50"
                        >
                          <option value="customer">عميل (Customer)</option>
                          <option value="investor">مستثمر (Investor)</option>
                          <option value="editor">محرر (Editor)</option>
                          <option value="admin">مدير (Admin)</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
