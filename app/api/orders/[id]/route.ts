import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireCustomerAuth, successResponse, errorResponse } from '@/lib/api-response';
import { transitionOrderStatus } from '@/lib/order-workflow';
import { generateInvoiceData } from '@/lib/invoice-generator';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireCustomerAuth();
  if (!auth.authorized) return auth.response;

  try {
    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        userId: auth.user.id,
      },
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
      return errorResponse('Order not found or unauthorized', 404);
    }

    const invoice = generateInvoiceData(order);

    return successResponse({
      order,
      invoice,
      canCancel: ['NEW', 'CONFIRMED', 'PROCESSING'].includes(order.status),
      canReturn: order.status === 'DELIVERED' && order.returns.length === 0,
    });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to fetch order details', 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireCustomerAuth();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { action, cancelReason, returnType = 'RETURN', reason, description, images, itemIds } = body;

    const order = await prisma.order.findFirst({
      where: { id: params.id, userId: auth.user.id },
      include: { items: true },
    });

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    // Action 1: Cancel Order
    if (action === 'CANCEL') {
      if (!['NEW', 'CONFIRMED', 'PROCESSING'].includes(order.status)) {
        return errorResponse(
          `Order cannot be cancelled in "${order.status}" status. Please contact our VIP Concierge.`,
          400
        );
      }

      const transition = await transitionOrderStatus({
        orderId: order.id,
        nextStatus: 'CANCELLED',
        cancelReason: cancelReason || 'Cancelled by Client',
        performedBy: auth.user.id,
        comment: `Order cancelled by patron: ${cancelReason || 'No reason specified'}`,
      });

      if (!transition.success) {
        return errorResponse(transition.error || 'Failed to cancel order', 400);
      }

      return successResponse({ message: 'Order successfully cancelled', order: transition.order });
    }

    // Action 2: Request Return / Replacement / Refund
    if (action === 'RETURN') {
      if (order.status !== 'DELIVERED') {
        return errorResponse('Returns can only be initiated for delivered orders', 400);
      }

      if (!reason || !reason.trim()) {
        return errorResponse('Please provide a reason for the return request', 400);
      }

      const requestNumber = `RET-AUR-${Math.floor(10000 + Math.random() * 90000)}`;

      const returnRequest = await prisma.returnRequest.create({
        data: {
          requestNumber,
          orderId: order.id,
          userId: auth.user.id,
          type: returnType, // RETURN, REPLACEMENT, REFUND
          reason,
          description: description || null,
          images: images ? JSON.stringify(images) : null,
          status: 'PENDING',
          refundAmount: order.grandTotal,
          items: {
            create: order.items.map((i) => ({
              orderItemId: i.id,
              quantity: i.quantity,
              condition: 'UNOPENED',
            })),
          },
        },
      });

      await transitionOrderStatus({
        orderId: order.id,
        nextStatus: 'RETURN_REQUESTED',
        comment: `Patron requested ${returnType} (Ref: ${requestNumber})`,
        performedBy: auth.user.id,
      });

      return successResponse({
        message: 'Return request submitted for concierge review',
        returnRequest,
      });
    }

    return errorResponse('Invalid action specified', 400);
  } catch (err: any) {
    return errorResponse(err.message || 'Action failed', 500);
  }
}
