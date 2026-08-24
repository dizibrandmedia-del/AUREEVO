import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCustomerSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session || !session.user) {
      return successResponse({ items: [] });
    }

    const items = await prisma.wishlist.findMany({
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
        variant: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            mrp: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ items });
  } catch (err: any) {
    return errorResponse('Failed to fetch wishlist', 500, err.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCustomerSession();
    if (!session || !session.user) {
      return errorResponse('Please sign in to save items to your permanent wishlist', 401);
    }

    const body = await req.json();
    const { productId, variantId } = body;

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Check for duplicate
    const existing = await prisma.wishlist.findFirst({
      where: {
        userId: session.user.id,
        productId,
        variantId: variantId || null,
      },
    });

    if (existing) {
      return successResponse({ message: 'Product already in wishlist', wishlist: existing });
    }

    const wishlist = await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        productId,
        variantId: variantId || null,
      },
    });

    return successResponse({ message: 'Added to wishlist', wishlist }, 201);
  } catch (err: any) {
    return errorResponse('Failed to save to wishlist', 500, err.message);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCustomerSession();
    if (!session || !session.user) {
      return errorResponse('Authentication required', 401);
    }

    const { searchParams } = new URL(req.url);
    const wishlistId = searchParams.get('wishlistId');
    const productId = searchParams.get('productId');

    if (wishlistId) {
      await prisma.wishlist.deleteMany({
        where: { id: wishlistId, userId: session.user.id },
      });
    } else if (productId) {
      await prisma.wishlist.deleteMany({
        where: { productId, userId: session.user.id },
      });
    } else {
      return errorResponse('Wishlist item identifier required', 400);
    }

    return successResponse({ message: 'Removed from wishlist' });
  } catch (err: any) {
    return errorResponse('Failed to remove from wishlist', 500, err.message);
  }
}
