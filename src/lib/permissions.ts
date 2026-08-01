/** Central permission codes + role display helpers for AL HISHAM DEVELOPMENT */

export const PERMISSIONS = [
  'projects.view', 'projects.create', 'projects.edit', 'projects.delete', 'projects.publish', 'projects.manage_images',
  'crm.view', 'crm.create', 'crm.edit', 'crm.assign', 'crm.reply', 'crm.export',
  'support.view', 'support.reply', 'support.assign', 'support.close', 'support.export',
  'customers.view', 'customers.edit', 'customers.export',
  'finance.view', 'finance.create', 'finance.edit', 'finance.export',
  'analytics.view', 'analytics.export',
  'content.view', 'content.create', 'content.edit', 'content.delete', 'content.publish',
  'users.view', 'users.create', 'users.edit', 'users.delete', 'users.change_role', 'users.manage_permissions',
  'reports.view', 'reports.export',
  'notifications.view', 'notifications.manage',
  'settings.view', 'settings.edit',
  'audit.view',
] as const;

export type PermissionCode = (typeof PERMISSIONS)[number] | string;

export type AppRole =
  | 'admin'
  | 'editor'
  | 'investor'
  | 'customer'
  | 'general_manager'
  | 'operations_manager'
  | 'customer_service_manager'
  | 'customer_service_agent'
  | 'sales_manager'
  | 'sales_agent'
  | 'finance_manager'
  | 'marketing_manager'
  | 'content_editor'
  | 'project_manager'
  | 'analyst';

export const STAFF_ROLES: AppRole[] = [
  'admin',
  'editor',
  'general_manager',
  'operations_manager',
  'customer_service_manager',
  'customer_service_agent',
  'sales_manager',
  'sales_agent',
  'finance_manager',
  'marketing_manager',
  'content_editor',
  'project_manager',
  'analyst',
];

export const ALL_ROLES: AppRole[] = [
  ...STAFF_ROLES,
  'investor',
  'customer',
];

/** DB role `admin` displays as Super Admin — value never migrated */
export const ROLE_LABELS_AR: Record<string, string> = {
  admin: 'Super Admin',
  editor: 'محرر',
  investor: 'مستثمر',
  customer: 'عميل',
  general_manager: 'مدير عام',
  operations_manager: 'مدير العمليات',
  customer_service_manager: 'مدير خدمة العملاء',
  customer_service_agent: 'موظف خدمة العملاء',
  sales_manager: 'مدير المبيعات',
  sales_agent: 'مندوب مبيعات',
  finance_manager: 'مدير المالية',
  marketing_manager: 'مدير التسويق',
  content_editor: 'محرر محتوى',
  project_manager: 'مدير المشاريع',
  analyst: 'محلل',
};

export const ROLE_LABELS_EN: Record<string, string> = {
  admin: 'Super Admin',
  editor: 'Editor',
  investor: 'Investor',
  customer: 'Customer',
  general_manager: 'General Manager',
  operations_manager: 'Operations Manager',
  customer_service_manager: 'Customer Service Manager',
  customer_service_agent: 'Customer Service Agent',
  sales_manager: 'Sales Manager',
  sales_agent: 'Sales Agent',
  finance_manager: 'Finance Manager',
  marketing_manager: 'Marketing Manager',
  content_editor: 'Content Editor',
  project_manager: 'Project Manager',
  analyst: 'Analyst',
};

export function getRoleLabel(role: string, lang: 'ar' | 'en' = 'ar'): string {
  return (lang === 'ar' ? ROLE_LABELS_AR : ROLE_LABELS_EN)[role] || role;
}

export function isStaffRole(role: string | null | undefined): boolean {
  return !!role && STAFF_ROLES.includes(role as AppRole);
}

/** Fallback when permissions table is unavailable — mirrors legacy access */
export function legacyRoleHasPermission(role: string, code: PermissionCode): boolean {
  if (role === 'admin') return true;
  if (role === 'editor') {
    return [
      'content.view', 'content.create', 'content.edit', 'content.publish',
      'projects.view', 'analytics.view', 'crm.view', 'crm.edit', 'crm.reply',
      'notifications.view',
    ].includes(code);
  }
  return false;
}
