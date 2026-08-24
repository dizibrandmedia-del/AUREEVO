import { NextRequest } from 'next/server';
import { calculateOrderTotals } from '@/lib/order-engine';
import { successResponse, errorResponse } from '@/lib/api-response';
import { verifyCustomerToken, getCustomerCookieName } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, couponCode, deliveryMethod, paymentMethod, shippingPincode } = body;

    // Optional user token
    let userId: string | null = null;
    const token = req.cookies.get(getCustomerCookieName())?.value;
    if (token) {
      const payload = await verifyCustomerToken(token);
      if (payload) userId = payload.userId;
    }

    const calculation = await calculateOrderTotals({
      items: items || [],
      couponCode,
      deliveryMethod,
      paymentMethod,
      userId,
      shippingPincode,
    });

    return successResponse(calculation);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to calculate order totals', 500);
  }
}
