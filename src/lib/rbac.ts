export type UserRole = "SUPER_ADMIN" | "ADMIN_MANAGER" | "SALES_MANAGER" | "LISTING_EXECUTIVE" | "CUSTOMER";

export interface RolePermissions {
  canViewPurchaseCost: boolean;
  canManageMargins: boolean;
  canApproveProducts: boolean;
  canPublishProducts: boolean;
  canManageSuppliers: boolean;
  canManageOrders: boolean;
  canManagePayments: boolean;
  canManageLeads: boolean;
  canCreateQuotations: boolean;
  canBulkUpload: boolean;
  canManageUsers: boolean;
  canViewAuditLogs: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  SUPER_ADMIN: {
    canViewPurchaseCost: true,
    canManageMargins: true,
    canApproveProducts: true,
    canPublishProducts: true,
    canManageSuppliers: true,
    canManageOrders: true,
    canManagePayments: true,
    canManageLeads: true,
    canCreateQuotations: true,
    canBulkUpload: true,
    canManageUsers: true,
    canViewAuditLogs: true,
  },
  ADMIN_MANAGER: {
    canViewPurchaseCost: true,
    canManageMargins: true,
    canApproveProducts: true,
    canPublishProducts: true,
    canManageSuppliers: true,
    canManageOrders: true,
    canManagePayments: true,
    canManageLeads: true,
    canCreateQuotations: true,
    canBulkUpload: true,
    canManageUsers: false,
    canViewAuditLogs: true,
  },
  SALES_MANAGER: {
    canViewPurchaseCost: false,
    canManageMargins: false,
    canApproveProducts: false,
    canPublishProducts: false,
    canManageSuppliers: false,
    canManageOrders: true,
    canManagePayments: false,
    canManageLeads: true,
    canCreateQuotations: true,
    canBulkUpload: false,
    canManageUsers: false,
    canViewAuditLogs: false,
  },
  LISTING_EXECUTIVE: {
    canViewPurchaseCost: false,
    canManageMargins: false,
    canApproveProducts: false,
    canPublishProducts: false,
    canManageSuppliers: false,
    canManageOrders: false,
    canManagePayments: false,
    canManageLeads: false,
    canCreateQuotations: false,
    canBulkUpload: true,
    canManageUsers: false,
    canViewAuditLogs: false,
  },
  CUSTOMER: {
    canViewPurchaseCost: false,
    canManageMargins: false,
    canApproveProducts: false,
    canPublishProducts: false,
    canManageSuppliers: false,
    canManageOrders: false,
    canManagePayments: false,
    canManageLeads: false,
    canCreateQuotations: false,
    canBulkUpload: false,
    canManageUsers: false,
    canViewAuditLogs: false,
  },
};

export function hasPermission(role: string, permission: keyof RolePermissions): boolean {
  const normalizedRole = role as UserRole;
  const perms = ROLE_PERMISSIONS[normalizedRole];
  if (!perms) return false;
  return perms[permission] ?? false;
}
