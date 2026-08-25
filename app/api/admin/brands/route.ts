import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { brandSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { logActivity } from '@/lib/activity-logger';

const FALLBACK_BRANDS = [
  { id: 'brand-1', name: 'AUREEVO LAB', slug: 'aureevo-lab', status: 'ACTIVE', isFeatured: true, _count: { products: 2 } },
  { id: 'brand-2', name: 'MAISON AUREEVO', slug: 'maison-aureevo', status: 'ACTIVE', isFeatured: true, _count: { products: 1 } },
  { id: 'brand-3', name: 'AUREEVO BOTANIQUE', slug: 'aureevo-botanique', status: 'ACTIVE', isFeatured: false, _count: { products: 1 } },
  { id: 'brand-4', name: 'AUREEVO JOAILLERIE', slug: 'aureevo-joaillerie', status: 'ACTIVE', isFeatured: true, _count: { products: 1 } },
];

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

    if (brands && brands.length > 0) {
      return successResponse({ brands });
    }
    return successResponse({ brands: FALLBACK_BRANDS });
  } catch (error: any) {
    console.error('Fetch brands fallback:', error);
    return successResponse({ brands: FALLBACK_BRANDS });
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
    }).catch(() => null);

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

    try {
      await logActivity({
        adminUserId: auth.admin?.id,
        action: 'CREATE',
        entity: 'Brand',
        entityId: brand.id,
        metadata: { name: brand.name, slug: brand.slug },
      });
    } catch {
      // Non-critical
    }

    return successResponse({ brand }, 201);
  } catch (error: any) {
    console.error('Create brand error:', error);
    return errorResponse('Failed to create brand', 500);
  }
}
