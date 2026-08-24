import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        brand: true,
        category: {
          include: {
            parent: true,
          },
        },
        variants: {
          where: { status: 'ACTIVE' },
          orderBy: { price: 'asc' },
        },
        inventories: {
          include: { warehouse: true },
        },
        productAttributes: {
          include: {
            attribute: true,
            attributeValue: true,
          },
        },
        reviews: {
          where: { status: 'APPROVED' },
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product || product.status !== 'ACTIVE') {
      return errorResponse('Luxury formulation not found or currently archived', 404);
    }

    // Fetch rule-based recommendations (Same category or brand)
    const relatedProducts = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        id: { not: product.id },
        OR: [
          { categoryId: product.categoryId },
          { brandId: product.brandId },
        ],
      },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
        variants: true,
      },
      take: 4,
    });

    // Compute stock status
    const totalPhysicalStock =
      product.productType === 'VARIABLE'
        ? product.variants.reduce((acc, v) => acc + v.stock, 0)
        : product.inventories.reduce((acc, inv) => acc + inv.currentStock, 0);

    return successResponse({
      product: {
        ...product,
        totalStock: totalPhysicalStock,
        isInStock: totalPhysicalStock > 0,
      },
      relatedProducts,
    });
  } catch (err: any) {
    return errorResponse('Failed to fetch product details', 500, err.message);
  }
}
