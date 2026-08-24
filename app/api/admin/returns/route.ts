import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { transitionOrderStatus } from '@/lib/order-workflow';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.authorized) return auth.response;

  try {
    const returns = await prisma.returnRequest.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        order: {
          select: {
            id: true,
            orderNumber: true,
            grandTotal: true,
            status: true,
            createdAt: true,
          },
        },
        items: {
          include: {
            orderItem: true,
          },
        },
        refunds: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ returns });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to fetch returns', 500);
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { returnRequestId, action, adminComment, refundAmount } = body;

    const returnReq = await prisma.returnRequest.findUnique({
      where: { id: returnRequestId },
      include: { order: true, refunds: true },
    });

    if (!returnReq) {
      return errorResponse('Return request not found', 404);
    }

    // Action: APPROVE
    if (action === 'APPROVE') {
      const updated = await prisma.returnRequest.update({
        where: { id: returnRequestId },
        data: {
          status: 'APPROVED',
          adminComment: adminComment || 'Return approved by Luxury Quality Concierge',
        },
      });

      await transitionOrderStatus({
        orderId: returnReq.orderId,
        nextStatus: 'RETURN_APPROVED',
        comment: `Return request ${returnReq.requestNumber} approved`,
        performedBy: auth.admin.id,
      });

      return successResponse({ message: 'Return approved', returnRequest: updated });
    }

    // Action: REJECT
    if (action === 'REJECT') {
      const updated = await prisma.returnRequest.update({
        where: { id: returnRequestId },
        data: {
          status: 'REJECTED',
          adminComment: adminComment || 'Return request rejected',
        },
      });

      return successResponse({ message: 'Return rejected', returnRequest: updated });
    }

    // Action: REFUND
    if (action === 'REFUND') {
      // Check for duplicate refund
      const existingSuccessRefund = returnReq.refunds.find((r) => r.status === 'SUCCESS');
      if (existingSuccessRefund) {
        return errorResponse(
          `Refund has already been processed for this return (Ref: ${existingSuccessRefund.referenceNumber})`,
          400
        );
      }

      const finalRefundAmount = refundAmount || returnReq.refundAmount || returnReq.order.grandTotal;
      const refNumber = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

      const refund = await prisma.refund.create({
        data: {
          returnRequestId: returnReq.id,
          orderId: returnReq.orderId,
          amount: finalRefundAmount,
          reason: returnReq.reason || 'Client Return Approved',
          gateway: 'RAZORPAY',
          status: 'SUCCESS',
          referenceNumber: refNumber,
          processedAt: new Date(),
        },
      });

      await prisma.returnRequest.update({
        where: { id: returnRequestId },
        data: {
          status: 'COMPLETED',
          refundStatus: 'COMPLETED',
        },
      });

      await transitionOrderStatus({
        orderId: returnReq.orderId,
        nextStatus: 'REFUNDED',
        comment: `Refund of ₹${finalRefundAmount.toLocaleString(
          'en-IN'
        )} completed (Ref: ${refNumber})`,
        performedBy: auth.admin.id,
      });

      return successResponse({ message: 'Refund successfully completed', refund });
    }

    return errorResponse('Invalid return action', 400);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to process return action', 500);
  }
}
