import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            grandTotal: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedCustomers = customers.map((c) => {
      const completedOrders = c.orders.filter((o) => o.status !== 'CANCELLED');
      const lifetimeSpend = completedOrders.reduce((sum, o) => sum + o.grandTotal, 0);

      return {
        id: c.id,
        name: `${c.firstName} ${c.lastName}`.trim() || 'Valued Patron',
        email: c.email,
        phone: c.phone || '—',
        status: c.status,
        createdAt: c.createdAt,
        totalOrders: c.orders.length,
        lifetimeSpend,
        isVip: lifetimeSpend >= 50000 || c.orders.length >= 5,
      };
    });

    return successResponse({ customers: formattedCustomers });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to fetch customer directory', 500);
  }
}
