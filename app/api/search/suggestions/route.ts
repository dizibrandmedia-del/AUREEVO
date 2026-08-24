import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query || query.length < 2) {
      return successResponse({
        products: [],
        categories: [],
        brands: [],
        popularSearches: ['24k Gold Serum', 'Oud & Rose Extrait', 'Midnight Crème', 'Haute Skincare'],
      });
    }

    const [products, categories, brands] = await Promise.all([
      prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { name: { contains: query } },
            { sku: { contains: query } },
            { tags: { contains: query } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          sellingPrice: true,
          images: true,
          brand: { select: { name: true } },
          category: { select: { name: true, slug: true } },
        },
        take: 5,
      }),
      prisma.category.findMany({
        where: {
          status: 'ACTIVE',
          name: { contains: query },
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: 3,
      }),
      prisma.brand.findMany({
        where: {
          status: 'ACTIVE',
          name: { contains: query },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
        },
        take: 3,
      }),
    ]);

    const formattedProducts = products.map((p) => {
      const images = p.images ? JSON.parse(p.images) : [];
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        price: p.sellingPrice,
        image: images[0] || '/images/aureevo-logo.png',
        brandName: p.brand?.name || 'AUREEVO',
        categoryName: p.category?.name,
      };
    });

    return successResponse({
      products: formattedProducts,
      categories,
      brands,
      query,
    });
  } catch (err: any) {
    return errorResponse('Search suggestion failure', 500, err.message);
  }
}
