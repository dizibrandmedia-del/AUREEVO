import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { transitionOrderStatus } from '@/lib/order-workflow';
import { generateInvoiceData } from '@/lib/invoice-generator';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (!auth.authorized) return auth.response;

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        payments: true,
        shipments: true,
        returns: { include: { items: true, refunds: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    const invoice = generateInvoiceData(order);

    return successResponse({ order, invoice });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to fetch order details', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { status, comment, cancelReason, notes } = body;

    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) {
      return errorResponse('Order not found', 404);
    }

    if (notes !== undefined) {
      await prisma.order.update({
        where: { id: params.id },
        data: { notes },
      });
    }

    if (status && status !== order.status) {
      const transition = await transitionOrderStatus({
        orderId: params.id,
        nextStatus: status,
        comment: comment || `Status updated by Admin (${auth.admin.email})`,
        performedBy: auth.admin.id,
        cancelReason,
      });

      if (!transition.success) {
        return errorResponse(transition.error || 'Status update failed', 400);
      }

      // Log admin activity
      await prisma.activityLog.create({
        data: {
          adminUserId: auth.admin.id,
          action: 'UPDATE_ORDER_STATUS',
          entity: 'Order',
          entityId: order.id,
          metadata: JSON.stringify({
            orderNumber: order.orderNumber,
            fromStatus: order.status,
            toStatus: status,
          }),
        },
      });

      return successResponse({ order: transition.order });
    }

    return successResponse({ message: 'Order updated successfully' });
  } catch (err: any) {
    return errorResponse(err.message || 'Order update failed', 500);
  }
}
