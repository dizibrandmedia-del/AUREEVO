import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const paymentMethod = searchParams.get('paymentMethod') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (paymentMethod && paymentMethod !== 'ALL') {
      where.payments = { some: { paymentMethod } };
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { guestEmail: { contains: search } },
        { guestName: { contains: search } },
        { user: { email: { contains: search } } },
        { user: { firstName: { contains: search } } },
        { user: { lastName: { contains: search } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          items: {
            include: {
              product: { select: { name: true, slug: true } },
            },
          },
          payments: true,
          shipments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }).catch(() => []),
      prisma.order.count({ where }).catch(() => 0),
    ]);

    return successResponse({
      orders: orders || [],
      pagination: {
        total: total || 0,
        page,
        limit,
        totalPages: Math.ceil((total || 0) / limit) || 1,
      },
    });
  } catch (err: any) {
    console.error('Fetch orders fallback:', err);
    return successResponse({
      orders: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 15,
        totalPages: 1,
      },
    });
  }
}
