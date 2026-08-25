import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { categorySchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { logActivity } from '@/lib/activity-logger';

const FALLBACK_ADMIN_CATEGORIES = [
  {
    id: 'cat-1',
    name: 'Haute Parfumerie',
    slug: 'fragrance',
    description: 'Bespoke extraits de parfum distilled from Grasse rose and aged oud.',
    status: 'ACTIVE',
    sortOrder: 1,
    parent: null,
    children: [
      { id: 'sub-1', name: 'Pure Parfums', slug: 'pure-parfums', status: 'ACTIVE', sortOrder: 1, _count: { products: 1, children: 0 } },
      { id: 'sub-2', name: 'Artisanal Extraits', slug: 'artisanal-extraits', status: 'ACTIVE', sortOrder: 2, _count: { products: 1, children: 0 } },
    ],
    _count: { products: 2 },
  },
  {
    id: 'cat-2',
    name: 'Cellular Skincare',
    slug: 'skincare',
    description: 'Rare Swiss 24K colloidal gold & royal saffron cellular formulations.',
    status: 'ACTIVE',
    sortOrder: 2,
    parent: null,
    children: [
      { id: 'sub-3', name: 'Face Elixirs', slug: 'face-elixirs', status: 'ACTIVE', sortOrder: 1, _count: { products: 1, children: 0 } },
      { id: 'sub-4', name: 'Gold Serums', slug: 'gold-serums', status: 'ACTIVE', sortOrder: 2, _count: { products: 1, children: 0 } },
    ],
    _count: { products: 2 },
  },
  {
    id: 'cat-3',
    name: 'Artisanal Jewels',
    slug: 'jewelry',
    description: 'Handcrafted luxury pieces set in 18K solid gold and gemstones.',
    status: 'ACTIVE',
    sortOrder: 3,
    parent: null,
    children: [
      { id: 'sub-5', name: 'Fine Necklaces', slug: 'fine-necklaces', status: 'ACTIVE', sortOrder: 1, _count: { products: 1, children: 0 } },
      { id: 'sub-6', name: 'Statement Rings', slug: 'statement-rings', status: 'ACTIVE', sortOrder: 2, _count: { products: 0, children: 0 } },
    ],
    _count: { products: 1 },
  },
  {
    id: 'cat-4',
    name: 'Maison Accessories',
    slug: 'accessories',
    description: 'Fine Italian leather craftsmanship and bespoke silk creations.',
    status: 'ACTIVE',
    sortOrder: 4,
    parent: null,
    children: [
      { id: 'sub-7', name: 'Silk Scarves', slug: 'silk-scarves', status: 'ACTIVE', sortOrder: 1, _count: { products: 0, children: 0 } },
      { id: 'sub-8', name: 'Leather Goods', slug: 'leather-goods', status: 'ACTIVE', sortOrder: 2, _count: { products: 0, children: 0 } },
    ],
    _count: { products: 0 },
  },
];

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth('categories.view');
  if (!auth.authorized) return auth.response;

  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: { select: { id: true, name: true } },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            sortOrder: true,
            _count: { select: { products: true, children: true } },
          },
        },
        _count: { select: { products: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    if (categories && categories.length > 0) {
      return successResponse({ categories });
    }
    return successResponse({ categories: FALLBACK_ADMIN_CATEGORIES });
  } catch (error: any) {
    console.error('Fetch categories fallback:', error);
    return successResponse({ categories: FALLBACK_ADMIN_CATEGORIES });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth('categories.manage');
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Invalid category data', 400, parsed.error.format());
    }

    const { name, slug, description, image, parentId, sortOrder, status, isFeatured, metaTitle, metaDescription } =
      parsed.data;

    const finalSlug = slugify(slug || name);

    const existingSlug = await prisma.category.findUnique({
      where: { slug: finalSlug },
    }).catch(() => null);

    if (existingSlug) {
      return errorResponse('A category with this slug already exists', 400);
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description,
        image,
        parentId: parentId || null,
        sortOrder,
        status,
        isFeatured,
        metaTitle,
        metaDescription,
      },
      include: {
        parent: { select: { id: true, name: true } },
      },
    });

    try {
      await logActivity({
        adminUserId: auth.admin?.id,
        action: 'CREATE',
        entity: 'Category',
        entityId: category.id,
        metadata: { name: category.name, slug: category.slug },
      });
    } catch {
      // Non-critical
    }

    return successResponse({ category }, 201);
  } catch (error: any) {
    console.error('Create category error:', error);
    return errorResponse('Failed to create category', 500);
  }
}
