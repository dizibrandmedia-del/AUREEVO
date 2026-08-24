import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPaymentProvider } from '@/lib/payment';
import { transitionOrderStatus } from '@/lib/order-workflow';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, gatewayOrderId, paymentId, signature, gateway = 'razorpay' } = body;

    if (!orderId || !paymentId) {
      return errorResponse('Order ID and Payment ID are required for payment verification', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    // 1. Verify Payment with Payment Gateway
    const paymentProvider = getPaymentProvider(gateway);
    const verification = await paymentProvider.verifyPayment({
      orderId: order.id,
      gatewayOrderId: gatewayOrderId || order.payments?.[0]?.gatewayOrderId || '',
      paymentId,
      signature,
    });

    if (!verification.verified) {
      // Record failed payment attempt
      await prisma.payment.updateMany({
        where: { orderId: order.id },
        data: {
          status: 'FAILED',
          failureReason: verification.error || 'Payment signature verification failed',
        },
      });

      return errorResponse(verification.error || 'Payment verification failed', 400);
    }

    // 2. Mark Payment as SUCCESS
    await prisma.payment.updateMany({
      where: { orderId: order.id },
      data: {
        status: 'SUCCESS',
        transactionId: paymentId,
        signature: signature || null,
      },
    });

    // 3. Transition Order to CONFIRMED
    await transitionOrderStatus({
      orderId: order.id,
      nextStatus: 'CONFIRMED',
      comment: `Payment verified successfully via ${paymentProvider.name.toUpperCase()} (Ref: ${paymentId})`,
      performedBy: 'PAYMENT_GATEWAY',
    });

    return successResponse({
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: 'CONFIRMED',
      paymentId,
    });
  } catch (err: any) {
    return errorResponse(err.message || 'Payment verification error', 500);
  }
}
