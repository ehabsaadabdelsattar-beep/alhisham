import React, { useEffect, useMemo, useState } from 'react';
import { permissionsService, type PermissionRow } from '../../services/permissions';
import { STAFF_ROLES, getRoleLabel, type AppRole } from '../../lib/permissions';
import { useAuth } from '../../context/AuthContext';
import { FiShield, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';

export default function AdminRoles() {
  const { hasPermission, profile } = useAuth();
  const canManage = hasPermission('users.manage_permissions') || profile?.role === 'admin';
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [matrix, setMatrix] = useState<Record<string, Set<string>>>({});
  const [selectedRole, setSelectedRole] = useState<AppRole>('customer_service_agent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [perms, rolePerms] = await Promise.all([
        permissionsService.listPermissions(),
        permissionsService.listRolePermissions(),
      ]);
      setPermissions(perms);
      const m: Record<string, Set<string>> = {};
      for (const role of STAFF_ROLES) m[role] = new Set();
      for (const rp of rolePerms) {
        if (!m[rp.role]) m[rp.role] = new Set();
        const code = rp.permission?.code;
        if (code) m[rp.role].add(code);
      }
      // admin = all
      m.admin = new Set(perms.map(p => p.code));
      setMatrix(m);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل مصفوفة الأدوار. تأكد من تنفيذ Phase 2 SQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const categories = useMemo(() => {
    const map = new Map<string, PermissionRow[]>();
    for (const p of permissions) {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    }
    return [...map.entries()];
  }, [permissions]);

  const toggle = async (permissionId: string, code: string, enabled: boolean) => {
    if (!canManage || selectedRole === 'admin') return;
    setSaving(true);
    try {
      if (enabled) {
        await permissionsService.revokeRolePermission(selectedRole, permissionId);
      } else {
        await permissionsService.grantRolePermission(selectedRole, permissionId);
      }
      setMatrix(prev => {
        const next = { ...prev, [selectedRole]: new Set(prev[selectedRole] || []) };
        if (enabled) next[selectedRole].delete(code);
        else next[selectedRole].add(code);
        return next;
      });
    } catch (err: any) {
      setError(err.message || 'فشل تحديث الصلاحية');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">جاري تحميل الأدوار...</p>
      </div>
    );
  }

  if (error && permissions.length === 0) {
    return (
      <div className="p-8 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm space-y-3">
        <p className="font-semibold">Permission system not available yet</p>
        <p>{error}</p>
        <button onClick={load} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border text-sm">
          <FiRefreshCw className="w-4 h-4" /> إعادة المحاولة
        </button>
      </div>
    );
  }

  const roleSet = matrix[selectedRole] || new Set();

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white flex items-center gap-2">
            <FiShield className="text-gold" /> الأدوار ومصفوفة الصلاحيات
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            الدور `admin` يُعرض كـ Super Admin ويملك كل الصلاحيات تلقائياً
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-300 text-sm">
          <FiRefreshCw className="w-4 h-4" /> تحديث
        </button>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="flex flex-wrap gap-2">
        {STAFF_ROLES.map(role => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              selectedRole === role
                ? 'bg-gold/15 border-gold text-gold'
                : 'bg-white dark:bg-dark-light border-gray-200 dark:border-gray-700 text-gray-600'
            }`}
          >
            {getRoleLabel(role)}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-dark-light rounded-xl border border-gray-100 dark:border-gray-800 p-4 space-y-6">
        <h2 className="font-semibold text-dark dark:text-white">
          {getRoleLabel(selectedRole)}
          {selectedRole === 'admin' && <span className="text-xs text-gray-400 mr-2">(قراءة فقط — كامل الصلاحيات)</span>}
          {saving && <span className="text-xs text-gold mr-2">جاري الحفظ...</span>}
        </h2>

        {categories.map(([category, perms]) => (
          <div key={category}>
            <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-semibold">{category}</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {perms.map(p => {
                const on = roleSet.has(p.code) || selectedRole === 'admin';
                return (
                  <button
                    key={p.id}
                    disabled={!canManage || selectedRole === 'admin'}
                    onClick={() => toggle(p.id, p.code, on)}
                    className={`flex items-center gap-2 text-right px-3 py-2 rounded-lg border text-sm transition-colors disabled:opacity-70 ${
                      on
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500'
                    }`}
                  >
                    {on ? <FiCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <FiX className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    <span className="font-mono text-xs">{p.code}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
