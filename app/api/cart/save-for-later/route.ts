import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cartItemId, saveForLater } = body;

    if (!cartItemId) {
      return errorResponse('Cart item ID is required', 400);
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!item) {
      return errorResponse('Cart item not found', 404);
    }

    const updated = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { isSavedForLater: !!saveForLater },
    });

    return successResponse({
      message: saveForLater ? 'Item moved to Save for Later' : 'Item moved to Shopping Bag',
      item: updated,
    });
  } catch (err: any) {
    return errorResponse('Failed to update item state', 500, err.message);
  }
}
