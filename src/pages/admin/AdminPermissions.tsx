import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { permissionsService, type PermissionRow, type UserPermissionRow } from '../../services/permissions';
import { getRoleLabel } from '../../lib/permissions';
import { useAuth } from '../../context/AuthContext';
import { FiKey, FiRefreshCw, FiPlus, FiMinus, FiUser } from 'react-icons/fi';

interface SimpleUser {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
}

export default function AdminPermissions() {
  const { hasPermission, profile } = useAuth();
  const canManage = hasPermission('users.manage_permissions') || profile?.role === 'admin';
  const [params] = useSearchParams();
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState(params.get('user') || '');
  const [catalog, setCatalog] = useState<PermissionRow[]>([]);
  const [effective, setEffective] = useState<string[]>([]);
  const [overrides, setOverrides] = useState<UserPermissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedUser = users.find(u => u.id === selectedUserId);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .order('full_name');
    if (error) throw error;
    setUsers((data || []) as SimpleUser[]);
    if (!selectedUserId && data?.[0]) setSelectedUserId(data[0].id);
  };

  const loadUserPerms = async (userId: string) => {
    if (!userId) return;
    const [cat, eff, ov] = await Promise.all([
      permissionsService.listPermissions(),
      permissionsService.getEffectivePermissionCodes(userId),
      permissionsService.listUserOverrides(userId),
    ]);
    setCatalog(cat);
    setEffective(eff);
    setOverrides(ov);
  };

  const reload = async () => {
    try {
      setLoading(true);
      setError(null);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'فشل التحميل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    setBusy(true);
    loadUserPerms(selectedUserId)
      .catch((err: any) => setError(err.message || 'فشل تحميل صلاحيات المستخدم'))
      .finally(() => setBusy(false));
  }, [selectedUserId]);

  const overrideMap = useMemo(() => {
    const m = new Map<string, 'grant' | 'revoke'>();
    for (const o of overrides) {
      if (o.permission?.code) m.set(o.permission.code, o.effect);
    }
    return m;
  }, [overrides]);

  const setOverride = async (permissionId: string, effect: 'grant' | 'revoke') => {
    if (!canManage || !selectedUserId) return;
    if (selectedUserId === profile?.id) {
      setError('لا يمكنك تعديل صلاحياتك بنفسك');
      return;
    }
    setBusy(true);
    try {
      await permissionsService.setUserOverride(selectedUserId, permissionId, effect);
      await loadUserPerms(selectedUserId);
    } catch (err: any) {
      setError(err.message || 'فشل حفظ التجاوز');
    } finally {
      setBusy(false);
    }
  };

  const clearOverride = async (permissionId: string) => {
    if (!canManage || !selectedUserId) return;
    setBusy(true);
    try {
      await permissionsService.removeUserOverride(selectedUserId, permissionId);
      await loadUserPerms(selectedUserId);
    } catch (err: any) {
      setError(err.message || 'فشل إزالة التجاوز');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white flex items-center gap-2">
            <FiKey className="text-gold" /> إدارة الصلاحيات
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            منح أو سحب صلاحيات لمستخدم فردي دون تغيير دوره بالكامل
          </p>
        </div>
        <button onClick={reload} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-300 text-sm">
          <FiRefreshCw className="w-4 h-4" /> تحديث
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">{error}</div>
      )}

      <div className="bg-white dark:bg-dark-light rounded-xl border border-gray-100 dark:border-gray-800 p-4">
        <label className="text-xs text-gray-500 mb-1 block">اختر المستخدم</label>
        <select
          value={selectedUserId}
          onChange={e => setSelectedUserId(e.target.value)}
          className="w-full max-w-xl rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark px-3 py-2 text-sm"
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {(u.full_name || 'بدون اسم')} — {u.email || '—'} ({getRoleLabel(u.role)})
            </option>
          ))}
        </select>
        {selectedUser && (
          <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
            <FiUser className="w-3.5 h-3.5" />
            الدور الأساسي: {getRoleLabel(selectedUser.role)}
            {selectedUser.role === 'admin' && ' — يملك كل الصلاحيات تلقائياً'}
          </p>
        )}
      </div>

      {busy && <p className="text-xs text-gold">جاري التحديث...</p>}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-light rounded-xl border border-gray-100 dark:border-gray-800 p-4">
          <h2 className="font-semibold mb-3">الصلاحيات الفعلية ({effective.length})</h2>
          {effective.length === 0 ? (
            <p className="text-sm text-gray-400">No permissions yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-80 overflow-y-auto">
              {effective.map(code => (
                <span key={code} className="text-[11px] font-mono px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
                  {code}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-dark-light rounded-xl border border-gray-100 dark:border-gray-800 p-4">
          <h2 className="font-semibold mb-3">تجاوزات المستخدم (Grant / Revoke)</h2>
          {overrides.length === 0 ? (
            <p className="text-sm text-gray-400 mb-4">No overrides yet.</p>
          ) : (
            <ul className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {overrides.map(o => (
                <li key={o.id} className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                  <span className="font-mono text-xs">{o.permission?.code}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${o.effect === 'grant' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {o.effect}
                    </span>
                    {canManage && (
                      <button onClick={() => clearOverride(o.permission_id)} className="text-xs text-gray-500 hover:text-red-500">إزالة</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {canManage && selectedUser?.role !== 'admin' && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {catalog.map(p => {
                const ov = overrideMap.get(p.code);
                return (
                  <div key={p.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-50 dark:border-gray-800">
                    <div className="min-w-0">
                      <p className="font-mono text-xs truncate">{p.code}</p>
                      <p className="text-[10px] text-gray-400">{p.category}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        disabled={ov === 'grant'}
                        onClick={() => setOverride(p.id, 'grant')}
                        className="p-1.5 rounded border text-emerald-600 hover:bg-emerald-50 disabled:opacity-40"
                        title="Grant"
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={ov === 'revoke'}
                        onClick={() => setOverride(p.id, 'revoke')}
                        className="p-1.5 rounded border text-red-600 hover:bg-red-50 disabled:opacity-40"
                        title="Revoke"
                      >
                        <FiMinus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
