import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transitionOrderStatus } from '@/lib/order-workflow';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || req.headers.get('stripe-signature');
    let event: any;

    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Handle Payment Captured Event (e.g. Razorpay: payment.captured or order.paid)
    if (event.event === 'payment.captured' || event.event === 'order.paid' || event.type === 'payment_intent.succeeded') {
      const paymentEntity = event.payload?.payment?.entity || event.data?.object;
      const gatewayOrderId = paymentEntity?.order_id || paymentEntity?.id;
      const paymentId = paymentEntity?.id;

      if (gatewayOrderId) {
        const payment = await prisma.payment.findFirst({
          where: { gatewayOrderId },
          include: { order: true },
        });

        if (payment && payment.status !== 'SUCCESS') {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'SUCCESS',
              transactionId: paymentId,
            },
          });

          if (payment.order.status === 'NEW') {
            await transitionOrderStatus({
              orderId: payment.orderId,
              nextStatus: 'CONFIRMED',
              comment: `Payment captured via Webhook (Payment ID: ${paymentId})`,
              performedBy: 'PAYMENT_WEBHOOK',
            });
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok', received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}
