import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { brandSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { logActivity } from '@/lib/activity-logger';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth('brands.view');
  if (!auth.authorized) return auth.response;

  try {
    const brand = await prisma.brand.findUnique({
      where: { id: params.id },
      include: {
        products: {
          select: { id: true, name: true, sku: true, sellingPrice: true, status: true },
        },
        _count: { select: { products: true } },
      },
    });

    if (!brand) return errorResponse('Brand not found', 404);
    return successResponse({ brand });
  } catch (error) {
    return errorResponse('Failed to fetch brand', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth('brands.manage');
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const parsed = brandSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Invalid brand data', 400, parsed.error.format());
    }

    const { name, slug, logo, banner, description, website, status, isFeatured, metaTitle, metaDescription } =
      parsed.data;

    const finalSlug = slugify(slug || name);

    const existing = await prisma.brand.findFirst({
      where: {
        OR: [{ slug: finalSlug }, { name }],
        NOT: { id: params.id },
      },
    });

    if (existing) {
      return errorResponse('Another brand with this name or slug already exists', 400);
    }

    const brand = await prisma.brand.update({
      where: { id: params.id },
      data: {
        name,
        slug: finalSlug,
        logo,
        banner,
        description,
        website,
        status,
        isFeatured,
        metaTitle,
        metaDescription,
      },
    });

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'UPDATE',
      entity: 'Brand',
      entityId: brand.id,
      metadata: { name: brand.name, slug: brand.slug },
    });

    return successResponse({ brand });
  } catch (error: any) {
    console.error('Update brand error:', error);
    return errorResponse('Failed to update brand', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth('brands.manage');
  if (!auth.authorized) return auth.response;

  try {
    const existing = await prisma.brand.findUnique({
      where: { id: params.id },
      include: { _count: { select: { products: true } } },
    });

    if (!existing) return errorResponse('Brand not found', 404);

    if (existing._count.products > 0) {
      return errorResponse(
        `Cannot delete brand: Contains ${existing._count.products} associated product(s). Unlink products first.`,
        400
      );
    }

    await prisma.brand.delete({
      where: { id: params.id },
    });

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'DELETE',
      entity: 'Brand',
      entityId: params.id,
      metadata: { name: existing.name },
    });

    return successResponse({ message: 'Brand deleted successfully' });
  } catch (error: any) {
    console.error('Delete brand error:', error);
    return errorResponse('Failed to delete brand', 500);
  }
}
