import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { brandSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { logActivity } from '@/lib/activity-logger';

export async function GET() {
  const auth = await requireAdminAuth('brands.view');
  if (!auth.authorized) return auth.response;

  try {
    const brands = await prisma.brand.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });

    return successResponse({ brands });
  } catch (error: any) {
    console.error('Fetch brands error:', error);
    return errorResponse('Failed to fetch brands', 500);
  }
}

export async function POST(req: NextRequest) {
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
      where: { OR: [{ slug: finalSlug }, { name }] },
    });

    if (existing) {
      return errorResponse('A brand with this name or slug already exists', 400);
    }

    const brand = await prisma.brand.create({
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
      action: 'CREATE',
      entity: 'Brand',
      entityId: brand.id,
      metadata: { name: brand.name, slug: brand.slug },
    });

    return successResponse({ brand }, 201);
  } catch (error: any) {
    console.error('Create brand error:', error);
    return errorResponse('Failed to create brand', 500);
  }
}
