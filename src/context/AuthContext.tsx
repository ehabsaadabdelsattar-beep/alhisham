import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { AppRole, PermissionCode } from '../lib/permissions';
import { isStaffRole, legacyRoleHasPermission } from '../lib/permissions';
import { permissionsService } from '../services/permissions';

export interface Profile {
  id: string;
  role: AppRole;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active?: boolean;
  is_staff?: boolean;
  last_seen_at?: string | null;
  department?: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  role: AppRole;
  permissions: string[];
  permissionsLoaded: boolean;
  hasPermission: (code: PermissionCode) => boolean;
  canAccessAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isEmailVerified: false,
  isPhoneVerified: false,
  role: 'customer',
  permissions: [],
  permissionsLoaded: false,
  hasPermission: () => false,
  canAccessAdmin: false,
  signOut: async () => {},
  refreshProfile: async () => {},
  refreshPermissions: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  const isEmailVerified = !!user?.email_confirmed_at;
  const isPhoneVerified = !!user?.phone_confirmed_at;
  const role = (profile?.role || 'customer') as AppRole;

  const loadPermissions = async (currentProfile: Profile) => {
    try {
      if (currentProfile.role === 'admin') {
        // Super Admin — full catalog (or all known codes if table empty)
        try {
          const catalog = await permissionsService.listPermissions();
          setPermissions(catalog.length ? catalog.map(p => p.code) : permissionsService.knownPermissionCodes());
        } catch {
          setPermissions(permissionsService.knownPermissionCodes());
        }
        setPermissionsLoaded(true);
        return;
      }

      const codes = await permissionsService.getEffectivePermissionCodes(currentProfile.id);
      setPermissions(codes);
      setPermissionsLoaded(true);
    } catch (err) {
      console.warn('Permissions load fallback to legacy role map:', err);
      const fallback = permissionsService.knownPermissionCodes().filter(c =>
        legacyRoleHasPermission(currentProfile.role, c)
      );
      setPermissions(fallback);
      setPermissionsLoaded(true);
    }
  };

  const fetchProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.warn('Profile fetch notice:', error.message);
        const fallbackProfile: Profile = {
          id: currentUser.id,
          role: 'customer',
          full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User',
          email: currentUser.email || null,
          phone: currentUser.user_metadata?.phone || currentUser.phone || null,
          avatar_url: null,
          is_active: true,
          is_staff: false,
          created_at: currentUser.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(fallbackProfile);
        setPermissions([]);
        setPermissionsLoaded(true);

        try {
          await supabase.from('profiles').upsert([{
            id: currentUser.id,
            role: 'customer',
            full_name: fallbackProfile.full_name,
            email: fallbackProfile.email,
            phone: fallbackProfile.phone,
            avatar_url: fallbackProfile.avatar_url,
            created_at: fallbackProfile.created_at,
            updated_at: fallbackProfile.updated_at,
          }]);
        } catch {
          // Ignore if row already exists
        }
        return;
      }

      const p = data as Profile;
      const normalizedFullName = currentUser.user_metadata?.full_name || p.full_name || currentUser.email?.split('@')[0] || 'User';
      const normalizedEmail = currentUser.email || p.email || null;
      const normalizedPhone = currentUser.user_metadata?.phone || currentUser.phone || p.phone || null;

      const normalizedProfile: Profile = {
        ...p,
        role: p.role || 'customer',
        full_name: normalizedFullName,
        email: normalizedEmail,
        phone: normalizedPhone,
        avatar_url: p.avatar_url || null,
        is_active: p.is_active ?? true,
        is_staff: p.is_staff ?? false,
      };

      if (
        p.full_name !== normalizedFullName ||
        p.email !== normalizedEmail ||
        p.phone !== normalizedPhone
      ) {
        try {
          await supabase.from('profiles').upsert({
            id: currentUser.id,
            role: normalizedProfile.role,
            full_name: normalizedFullName,
            email: normalizedEmail,
            phone: normalizedPhone,
            avatar_url: normalizedProfile.avatar_url,
            created_at: normalizedProfile.created_at,
            updated_at: new Date().toISOString(),
          });
        } catch (syncError) {
          console.warn('Profile sync warning:', syncError);
        }
      }

      if (p.is_active === false) {
        setProfile(normalizedProfile);
        setPermissions([]);
        setPermissionsLoaded(true);
        return;
      }

      setProfile(normalizedProfile);
      await loadPermissions(normalizedProfile);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setProfile(null);
        setPermissions([]);
        setPermissionsLoaded(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) await fetchProfile(user);
  };

  const refreshPermissions = async () => {
    if (profile) await loadPermissions(profile);
  };

  const hasPermission = (code: PermissionCode): boolean => {
    if (!profile || profile.is_active === false) return false;
    if (profile.role === 'admin') return true;
    if (permissionsLoaded && permissions.length > 0) {
      return permissions.includes(code);
    }
    return legacyRoleHasPermission(profile.role, code);
  };

  const canAccessAdmin =
    !!profile &&
    profile.is_active !== false &&
    (profile.role === 'admin' ||
      profile.role === 'editor' ||
      profile.is_staff === true ||
      isStaffRole(profile.role));

  const signOut = async () => {
    setProfile(null);
    setUser(null);
    setSession(null);
    setPermissions([]);
    setPermissionsLoaded(false);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        isEmailVerified,
        isPhoneVerified,
        role,
        permissions,
        permissionsLoaded,
        hasPermission,
        canAccessAdmin,
        signOut,
        refreshProfile,
        refreshPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
