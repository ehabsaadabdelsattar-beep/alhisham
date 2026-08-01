import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { PermissionCode } from '../lib/permissions';
import { isStaffRole } from '../lib/permissions';

interface ProtectedRouteProps {
  /** Legacy role gate — preserved for backward compatibility */
  allowedRoles?: string[];
  /** Permission-aware gate (OR across codes) */
  requiredPermissions?: PermissionCode[];
  /** Require any staff/admin dashboard access */
  requireStaff?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  requiredPermissions,
  requireStaff,
}) => {
  const { session, profile, loading, hasPermission, canAccessAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (profile?.is_active === false) {
    return <Navigate to="/" replace />;
  }

  if (requireStaff) {
    const ok =
      canAccessAdmin ||
      (profile && (allowedRoles ? allowedRoles.includes(profile.role) : isStaffRole(profile.role)));
    if (!ok) return <Navigate to="/" replace />;
  } else if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Backward-compatible role check, with staff expansion for admin area paths
    const staffBypass =
      location.pathname.startsWith('/admin') &&
      (canAccessAdmin || isStaffRole(profile.role));
    if (!staffBypass) {
      return <Navigate to="/" replace />;
    }
  }

  if (requiredPermissions && requiredPermissions.length > 0) {
    const ok = requiredPermissions.some(p => hasPermission(p));
    if (!ok && profile?.role !== 'admin') {
      return <Navigate to="/admin" replace />;
    }
  }

  return <Outlet />;
};
