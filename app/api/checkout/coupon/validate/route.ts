import { NextRequest } from 'next/server';
import { validateAndApplyCoupon } from '@/lib/coupon-engine';
import { successResponse, errorResponse } from '@/lib/api-response';
import { verifyCustomerToken, getCustomerCookieName } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal, items, paymentMethod } = body;

    let userId: string | null = null;
    const token = req.cookies.get(getCustomerCookieName())?.value;
    if (token) {
      const payload = await verifyCustomerToken(token);
      if (payload) userId = payload.userId;
    }

    const result = await validateAndApplyCoupon({
      code,
      subtotal: subtotal || 0,
      items: items || [],
      userId,
      paymentMethod,
    });

    if (!result.isValid) {
      return errorResponse(result.error || 'Invalid privilege coupon', 400);
    }

    return successResponse(result);
  } catch (err: any) {
    return errorResponse(err.message || 'Coupon validation failed', 500);
  }
}
