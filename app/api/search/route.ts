import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';
    const categorySlug = searchParams.get('category') || '';
    const brandSlug = searchParams.get('brand') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const inStockOnly = searchParams.get('inStock') === 'true';
    const sortBy = searchParams.get('sort') || 'relevance';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '12', 10));

    const where: any = {
      status: 'ACTIVE',
    };

    if (query) {
      // Substring and fuzzy keyword matching
      where.OR = [
        { name: { contains: query } },
        { sku: { contains: query } },
        { tags: { contains: query } },
        { shortDescription: { contains: query } },
        { description: { contains: query } },
        { brand: { name: { contains: query } } },
        { category: { name: { contains: query } } },
      ];
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (brandSlug) {
      where.brand = { slug: brandSlug };
    }

    if (minPrice > 0 || maxPrice < 999999) {
      where.sellingPrice = {
        gte: minPrice,
        lte: maxPrice,
      };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { sellingPrice: 'asc' };
    if (sortBy === 'price_desc') orderBy = { sellingPrice: 'desc' };
    if (sortBy === 'rating') orderBy = { rating: 'desc' };
    if (sortBy === 'newest') orderBy = { createdAt: 'desc' };
    if (sortBy === 'bestseller') orderBy = { reviewCount: 'desc' };

    const [total, products, matchedCategories, matchedBrands] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          brand: { select: { id: true, name: true, slug: true } },
          category: { select: { id: true, name: true, slug: true } },
          variants: true,
          inventories: true,
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.category.findMany({
        where: {
          status: 'ACTIVE',
          products: { some: { status: 'ACTIVE' } },
        },
        select: { id: true, name: true, slug: true },
      }),
      prisma.brand.findMany({
        where: {
          status: 'ACTIVE',
          products: { some: { status: 'ACTIVE' } },
        },
        select: { id: true, name: true, slug: true },
      }),
    ]);

    let filteredProducts = products;
    if (inStockOnly) {
      filteredProducts = products.filter((p) => {
        const totalStock =
          p.productType === 'VARIABLE'
            ? p.variants.reduce((acc, v) => acc + v.stock, 0)
            : p.inventories.reduce((acc, inv) => acc + inv.currentStock, 0);
        return totalStock > 0;
      });
    }

    return successResponse({
      query,
      products: filteredProducts,
      pagination: {
        total: inStockOnly ? filteredProducts.length : total,
        page,
        limit,
        totalPages: Math.ceil((inStockOnly ? filteredProducts.length : total) / limit) || 1,
      },
      filters: {
        categories: matchedCategories,
        brands: matchedBrands,
      },
    });
  } catch (err: any) {
    return errorResponse('Search execution failed', 500, err.message);
  }
}
