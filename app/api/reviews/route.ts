import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireCustomerAuth, successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    const reviews = await prisma.customerReview.findMany({
      where: {
        productId,
        status: 'APPROVED',
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ reviews });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to fetch reviews', 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireCustomerAuth();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { productId, rating, title, comment, images } = body;

    if (!productId || !rating || !title || !comment) {
      return errorResponse('Product ID, rating, title, and comment are required', 400);
    }

    const parsedRating = parseInt(rating, 10);
    if (parsedRating < 1 || parsedRating > 5) {
      return errorResponse('Rating must be between 1 and 5 stars', 400);
    }

    // Check if customer has purchased this product and order was delivered (Verified Purchase)
    const verifiedOrder = await prisma.order.findFirst({
      where: {
        userId: auth.user.id,
        status: 'DELIVERED',
        items: {
          some: { productId },
        },
      },
    });

    const isVerifiedPurchase = !!verifiedOrder;

    const review = await prisma.customerReview.create({
      data: {
        productId,
        userId: auth.user.id,
        rating: parsedRating,
        title,
        comment,
        isVerifiedPurchase,
        status: 'APPROVED', // or PENDING based on moderation policy
      },
    });

    return successResponse({
      message: 'Review published successfully',
      review,
      isVerifiedPurchase,
    });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to submit review', 500);
  }
}
