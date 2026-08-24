import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireCustomerAuth, successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const auth = await requireCustomerAuth();
  if (!auth.authorized) return auth.response;

  try {
    const orders = await prisma.order.findMany({
      where: { userId: auth.user.id },
      include: {
        items: {
          include: {
            product: { select: { name: true, slug: true, images: true } },
          },
        },
        payments: true,
        shipments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ orders });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to fetch customer orders', 500);
  }
}
