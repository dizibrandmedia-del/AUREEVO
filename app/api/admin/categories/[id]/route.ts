import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { categorySchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { logActivity } from '@/lib/activity-logger';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth('categories.view');
  if (!auth.authorized) return auth.response;

  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        parent: true,
        children: true,
        _count: { select: { products: true } },
      },
    });

    if (!category) return errorResponse('Category not found', 404);
    return successResponse({ category });
  } catch (error) {
    return errorResponse('Failed to fetch category', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

    // Prevent making category parent of itself
    if (parentId === params.id) {
      return errorResponse('A category cannot be its own parent', 400);
    }

    const finalSlug = slugify(slug || name);

    const existingSlug = await prisma.category.findFirst({
      where: { slug: finalSlug, NOT: { id: params.id } },
    });

    if (existingSlug) {
      return errorResponse('Another category already uses this slug', 400);
    }

    const category = await prisma.category.update({
      where: { id: params.id },
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
      action: 'UPDATE',
      entity: 'Category',
      entityId: category.id,
      metadata: { name: category.name, slug: category.slug },
    });

    return successResponse({ category });
  } catch (error: any) {
    console.error('Update category error:', error);
    return errorResponse('Failed to update category', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth('categories.manage');
  if (!auth.authorized) return auth.response;

  try {
    const existing = await prisma.category.findUnique({
      where: { id: params.id },
      include: { _count: { select: { products: true, children: true } } },
    });

    if (!existing) return errorResponse('Category not found', 404);

    if (existing._count.products > 0) {
      return errorResponse(
        `Cannot delete category: Contains ${existing._count.products} associated product(s). Reassign products first.`,
        400
      );
    }

    await prisma.category.delete({
      where: { id: params.id },
    });

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'DELETE',
      entity: 'Category',
      entityId: params.id,
      metadata: { name: existing.name },
    });

    return successResponse({ message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return errorResponse('Failed to delete category', 500);
  }
}
