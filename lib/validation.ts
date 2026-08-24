import { z } from 'zod';

// Customer Auth Schemas
export const customerRegisterSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
});

export const customerLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Admin Auth Schemas
export const adminLoginSchema = z.object({
  email: z.string().email('Invalid admin email'),
  password: z.string().min(1, 'Password is required'),
});

// Category Schema
export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
});

// Brand Schema
export const brandSchema = z.object({
  name: z.string().min(2, 'Brand name must be at least 2 characters'),
  slug: z.string().optional(),
  logo: z.string().optional().nullable(),
  banner: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
});

// Attribute Schema
export const attributeSchema = z.object({
  name: z.string().min(2, 'Attribute name is required'),
  code: z.string().min(2, 'Attribute code is required'),
  type: z.enum(['TEXT', 'SELECT', 'MULTISELECT', 'COLOR', 'NUMBER', 'BOOLEAN']).default('TEXT'),
  isFilterable: z.boolean().default(true),
  isVariant: z.boolean().default(false),
  isRequired: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const attributeValueSchema = z.object({
  attributeId: z.string().min(1),
  value: z.string().min(1, 'Value is required'),
  label: z.string().min(1, 'Label is required'),
  hexColor: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

// Product Schema
export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  slug: z.string().optional(),
  sku: z.string().min(2, 'SKU is required'),
  brandId: z.string().optional().nullable(),
  categoryId: z.string().min(1, 'Category is required'),
  productType: z.enum(['SIMPLE', 'VARIABLE']).default('SIMPLE'),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  shortDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  highlights: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  specifications: z.record(z.string()).optional(),
  ingredients: z.string().optional().nullable(),
  howToUse: z.string().optional().nullable(),
  mrp: z.number().nonnegative(),
  sellingPrice: z.number().nonnegative(),
  discountPercent: z.number().min(0).max(100).default(0),
  taxRate: z.number().default(18.0),
  images: z.array(z.string()).default([]),
  videoUrl: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  attributes: z
    .array(
      z.object({
        attributeId: z.string(),
        attributeValueId: z.string().optional().nullable(),
        customValue: z.string().optional().nullable(),
      })
    )
    .optional(),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        sku: z.string().min(1, 'Variant SKU is required'),
        name: z.string().min(1, 'Variant name is required'),
        price: z.number().nonnegative(),
        mrp: z.number().nonnegative(),
        stock: z.number().int().nonnegative().default(0),
        image: z.string().optional().nullable(),
        status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
        attributes: z.record(z.string()).optional(),
      })
    )
    .optional(),
  initialStock: z.number().int().nonnegative().optional(),
  warehouseId: z.string().optional(),
});

// Inventory Stock Adjustment Schema
export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional().nullable(),
  warehouseId: z.string().min(1),
  newQty: z.number().int().nonnegative(),
  action: z.enum(['ADJUSTMENT', 'RESTOCK', 'DAMAGE', 'RETURN', 'AUDIT']),
  reason: z.string().min(3, 'Adjustment reason is required'),
});

// Warehouse Schema
export const warehouseSchema = z.object({
  name: z.string().min(2, 'Warehouse name is required'),
  code: z.string().min(2, 'Warehouse code is required'),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().default('India'),
  contactName: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable().or(z.literal('')),
  isDefault: z.boolean().default(false),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

// Admin Settings Schema
export const adminSettingsSchema = z.record(z.any());
