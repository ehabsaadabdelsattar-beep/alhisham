import { supabase } from '../lib/supabase';
import type { AppRole, PermissionCode } from '../lib/permissions';
import { PERMISSIONS } from '../lib/permissions';

export interface PermissionRow {
  id: string;
  code: string;
  category: string;
  description: string | null;
}

export interface RolePermissionRow {
  id: string;
  role: string;
  permission_id: string;
  permission?: PermissionRow | null;
}

export interface UserPermissionRow {
  id: string;
  user_id: string;
  permission_id: string;
  effect: 'grant' | 'revoke';
  granted_by: string | null;
  created_at: string;
  permission?: PermissionRow | null;
}

export const permissionsService = {
  async listPermissions(): Promise<PermissionRow[]> {
    const { data, error } = await supabase
      .from('permissions')
      .select('id, code, category, description')
      .order('category')
      .order('code');
    if (error) throw error;
    return (data || []) as PermissionRow[];
  },

  async listRolePermissions(role?: string): Promise<RolePermissionRow[]> {
    let q = supabase
      .from('role_permissions')
      .select('id, role, permission_id, permission:permission_id ( id, code, category, description )');
    if (role) q = q.eq('role', role);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []) as unknown as RolePermissionRow[];
  },

  async listUserOverrides(userId: string): Promise<UserPermissionRow[]> {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('id, user_id, permission_id, effect, granted_by, created_at, permission:permission_id ( id, code, category, description )')
      .eq('user_id', userId);
    if (error) throw error;
    return (data || []) as unknown as UserPermissionRow[];
  },

  async getEffectivePermissionCodes(userId: string): Promise<string[]> {
    const { data, error } = await supabase.rpc('get_user_effective_permissions', {
      p_user_id: userId,
    });
    if (error) throw error;
    const rows = (data || []) as { code: string }[];
    return [...new Set(rows.map(r => r.code))];
  },

  async setUserOverride(userId: string, permissionId: string, effect: 'grant' | 'revoke') {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('user_permissions').upsert({
      user_id: userId,
      permission_id: permissionId,
      effect,
      granted_by: user?.id ?? null,
    }, { onConflict: 'user_id,permission_id' });
    if (error) throw error;
  },

  async removeUserOverride(userId: string, permissionId: string) {
    const { error } = await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', userId)
      .eq('permission_id', permissionId);
    if (error) throw error;
  },

  async grantRolePermission(role: AppRole, permissionId: string) {
    const { error } = await supabase.from('role_permissions').upsert({
      role,
      permission_id: permissionId,
    }, { onConflict: 'role,permission_id' });
    if (error) throw error;
  },

  async revokeRolePermission(role: AppRole, permissionId: string) {
    const { error } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role', role)
      .eq('permission_id', permissionId);
    if (error) throw error;
  },

  /** Client-side check against a loaded permission set (admin = all) */
  evaluate(codes: Set<string> | string[], permission: PermissionCode, role?: string): boolean {
    if (role === 'admin') return true;
    const set = codes instanceof Set ? codes : new Set(codes);
    return set.has(permission);
  },

  knownPermissionCodes(): string[] {
    return [...PERMISSIONS];
  },
};
