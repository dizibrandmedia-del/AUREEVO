import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCustomerSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const session = await getCustomerSession();
    if (!session || !session.user) {
      return successResponse({ products: [] });
    }

    const views = await prisma.recentlyViewed.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            sellingPrice: true,
            mrp: true,
            images: true,
            rating: true,
            reviewCount: true,
            status: true,
            brand: { select: { name: true } },
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { viewedAt: 'desc' },
      take: 8,
    });

    const activeProducts = views
      .filter((v) => v.product && v.product.status === 'ACTIVE')
      .map((v) => v.product);

    return successResponse({ products: activeProducts });
  } catch (err: any) {
    return errorResponse('Failed to fetch recently viewed items', 500, err.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCustomerSession();
    if (!session || !session.user) {
      return successResponse({ message: 'Guest view ignored' });
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Upsert view timestamp
    await prisma.recentlyViewed.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      update: { viewedAt: new Date() },
      create: {
        userId: session.user.id,
        productId,
        viewedAt: new Date(),
      },
    });

    return successResponse({ message: 'View recorded' });
  } catch (err: any) {
    return errorResponse('Failed to record product view', 500, err.message);
  }
}
