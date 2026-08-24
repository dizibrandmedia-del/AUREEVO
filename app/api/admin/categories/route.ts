import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { categorySchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { logActivity } from '@/lib/activity-logger';

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

    return successResponse({ categories });
  } catch (error: any) {
    console.error('Fetch categories error:', error);
    return errorResponse('Failed to fetch categories', 500);
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
    });

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

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'CREATE',
      entity: 'Category',
      entityId: category.id,
      metadata: { name: category.name, slug: category.slug },
    });

    return successResponse({ category }, 201);
  } catch (error: any) {
    console.error('Create category error:', error);
    return errorResponse('Failed to create category', 500);
  }
}
