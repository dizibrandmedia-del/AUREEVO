import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { getCourierProvider } from '@/lib/courier';
import { transitionOrderStatus } from '@/lib/order-workflow';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { courier = 'BLUE_DART', customAwb } = body;

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true, payments: true },
    });

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    const shippingAddress = typeof order.shippingAddress === 'string'
      ? JSON.parse(order.shippingAddress)
      : order.shippingAddress;

    const courierProvider = getCourierProvider(courier);
    const shipmentResult = await courierProvider.createShipment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      recipient: {
        name: shippingAddress.name || 'Patron',
        phone: shippingAddress.phone || '',
        addressLine1: shippingAddress.addressLine1 || '',
        addressLine2: shippingAddress.addressLine2,
        city: shippingAddress.city || 'Mumbai',
        state: shippingAddress.state || 'Maharashtra',
        pincode: shippingAddress.pincode || '400001',
      },
      items: order.items.map((i) => ({
        name: i.productName,
        sku: i.sku,
        quantity: i.quantity,
        price: i.unitPrice,
      })),
      totalAmount: order.grandTotal,
      isCod: order.payments?.[0]?.paymentMethod === 'COD',
      deliveryMethod: order.deliveryMethod,
    });

    const awbNumber = customAwb || shipmentResult.awbNumber;

    // Create or Update Shipment in Database
    const shipment = await prisma.shipment.create({
      data: {
        orderId: order.id,
        courier: courierProvider.name,
        awbNumber,
        trackingUrl: shipmentResult.trackingUrl,
        labelUrl: shipmentResult.labelUrl,
        status: 'CREATED',
        timeline: JSON.stringify([
          {
            status: 'Shipment Created',
            time: new Date().toISOString(),
            description: `AWB ${awbNumber} assigned via ${courierProvider.name}`,
          },
        ]),
      },
    });

    // Advance Order status to SHIPPED if not already
    if (order.status !== 'SHIPPED') {
      await transitionOrderStatus({
        orderId: order.id,
        nextStatus: 'SHIPPED',
        comment: `Dispatched via ${courierProvider.name} with AWB Tracking: ${awbNumber}`,
        performedBy: auth.admin.id,
      });
    }

    return successResponse({
      message: 'Shipment created and AWB assigned successfully',
      shipment,
    });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to dispatch shipment', 500);
  }
}
