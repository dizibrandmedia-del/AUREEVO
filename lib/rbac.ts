// System Role Definitions
export const SYSTEM_ROLES = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    slug: 'super-admin',
    description: 'Complete unrestricted access across all system modules',
  },
  PRODUCT_MANAGER: {
    name: 'Product Manager',
    slug: 'product-manager',
    description: 'Manages products, categories, brands, attributes, and variants',
  },
  INVENTORY_MANAGER: {
    name: 'Inventory Manager',
    slug: 'inventory-manager',
    description: 'Manages stock levels, adjustments, and warehouses',
  },
  WAREHOUSE_MANAGER: {
    name: 'Warehouse Manager',
    slug: 'warehouse-manager',
    description: 'Executes warehouse level operations and stock adjustments',
  },
  ORDER_MANAGER: {
    name: 'Order Manager',
    slug: 'order-manager',
    description: 'Manages customer orders, shipments, and fulfillments',
  },
  MARKETING_MANAGER: {
    name: 'Marketing Manager',
    slug: 'marketing-manager',
    description: 'Manages discounts, coupons, banners, and campaigns',
  },
  CUSTOMER_SUPPORT: {
    name: 'Customer Support',
    slug: 'customer-support',
    description: 'Assists customers, manages inquiries, and reviews orders',
  },
  FINANCE: {
    name: 'Finance',
    slug: 'finance',
    description: 'Views sales reports, taxes, invoices, and financial logs',
  },
} as const;

// Granular Permissions
export const PERMISSIONS = [
  // Products
  { code: 'products.view', name: 'View Products', module: 'Products', description: 'Can view product list and details' },
  { code: 'products.create', name: 'Create Products', module: 'Products', description: 'Can create new products' },
  { code: 'products.edit', name: 'Edit Products', module: 'Products', description: 'Can modify existing products' },
  { code: 'products.delete', name: 'Delete Products', module: 'Products', description: 'Can delete or archive products' },
  { code: 'products.duplicate', name: 'Duplicate Products', module: 'Products', description: 'Can clone existing products' },

  // Categories
  { code: 'categories.view', name: 'View Categories', module: 'Categories', description: 'Can view category list and hierarchy' },
  { code: 'categories.manage', name: 'Manage Categories', module: 'Categories', description: 'Can create, edit, delete and reorder categories' },

  // Brands
  { code: 'brands.view', name: 'View Brands', module: 'Brands', description: 'Can view brand list and details' },
  { code: 'brands.manage', name: 'Manage Brands', module: 'Brands', description: 'Can create, edit, and delete brands' },

  // Attributes
  { code: 'attributes.view', name: 'View Attributes', module: 'Attributes', description: 'Can view dynamic attributes and values' },
  { code: 'attributes.manage', name: 'Manage Attributes', module: 'Attributes', description: 'Can create and edit attributes and values' },

  // Inventory & Warehouses
  { code: 'inventory.view', name: 'View Inventory', module: 'Inventory', description: 'Can view stock counts and low-stock alerts' },
  { code: 'inventory.adjust', name: 'Adjust Stock', module: 'Inventory', description: 'Can manually adjust stock and log reason' },
  { code: 'warehouses.manage', name: 'Manage Warehouses', module: 'Warehouses', description: 'Can create, edit, and manage warehouses' },

  // Media
  { code: 'media.view', name: 'View Media', module: 'Media', description: 'Can view media library' },
  { code: 'media.upload', name: 'Upload Media', module: 'Media', description: 'Can upload and delete media files' },

  // Settings & Logs
  { code: 'settings.view', name: 'View Settings', module: 'Settings', description: 'Can view store settings' },
  { code: 'settings.manage', name: 'Manage Settings', module: 'Settings', description: 'Can update store settings' },
  { code: 'logs.view', name: 'View Activity Logs', module: 'Audit', description: 'Can view admin audit trail' },

  // Admin Users & Roles
  { code: 'users.manage', name: 'Manage Admin Users', module: 'Admin Users', description: 'Can invite and modify admin users and roles' },

  // Import / Export
  { code: 'data.export', name: 'Export Data', module: 'Data', description: 'Can export CSV/Excel data' },
  { code: 'data.import', name: 'Import Data', module: 'Data', description: 'Can import CSV/Excel data' },
] as const;

// Role to Permission Mappings
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  'super-admin': PERMISSIONS.map((p) => p.code),
  'product-manager': [
    'products.view', 'products.create', 'products.edit', 'products.delete', 'products.duplicate',
    'categories.view', 'categories.manage',
    'brands.view', 'brands.manage',
    'attributes.view', 'attributes.manage',
    'media.view', 'media.upload',
    'inventory.view',
    'data.export', 'data.import',
  ],
  'inventory-manager': [
    'inventory.view', 'inventory.adjust',
    'warehouses.manage',
    'products.view',
    'data.export', 'data.import',
  ],
  'warehouse-manager': [
    'inventory.view', 'inventory.adjust',
    'products.view',
  ],
  'order-manager': [
    'products.view',
    'inventory.view',
  ],
  'marketing-manager': [
    'products.view',
    'categories.view',
    'brands.view',
    'media.view',
  ],
  'customer-support': [
    'products.view',
    'inventory.view',
  ],
  'finance': [
    'products.view',
    'inventory.view',
    'logs.view',
    'data.export',
  ],
};

export function hasPermission(adminPermissions: string[], requiredPermission: string): boolean {
  if (adminPermissions.includes('*') || adminPermissions.includes('all')) return true;
  return adminPermissions.includes(requiredPermission);
}
