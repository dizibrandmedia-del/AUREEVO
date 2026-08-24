import { prisma } from './prisma';

export interface CouponValidationInput {
  code: string;
  subtotal: number;
  items: Array<{ productId: string; variantId?: string | null; totalPrice: number }>;
  userId?: string | null;
  paymentMethod?: string;
}

export interface CouponValidationResult {
  isValid: boolean;
  code: string;
  discountType?: 'PERCENTAGE' | 'FLAT';
  discountValue?: number;
  discountAmount: number;
  error?: string;
}

export async function validateAndApplyCoupon(
  input: CouponValidationInput
): Promise<CouponValidationResult> {
  const { code, subtotal, items, userId = null, paymentMethod = 'UPI' } = input;

  if (!code || !code.trim()) {
    return { isValid: false, code: '', discountAmount: 0, error: 'Coupon code is required' };
  }

  const normalizedCode = code.trim().toUpperCase();

  const coupon = await prisma.coupon.findUnique({
    where: { code: normalizedCode },
  });

  if (!coupon) {
    return {
      isValid: false,
      code: normalizedCode,
      discountAmount: 0,
      error: `Privilege voucher "${normalizedCode}" does not exist`,
    };
  }

  if (!coupon.isActive) {
    return {
      isValid: false,
      code: normalizedCode,
      discountAmount: 0,
      error: `Privilege voucher "${normalizedCode}" is currently inactive`,
    };
  }

  const now = new Date();

  if (coupon.startDate && now < coupon.startDate) {
    return {
      isValid: false,
      code: normalizedCode,
      discountAmount: 0,
      error: `Privilege voucher is not active yet`,
    };
  }

  if (coupon.expiryDate && now > coupon.expiryDate) {
    return {
      isValid: false,
      code: normalizedCode,
      discountAmount: 0,
      error: `Privilege voucher has expired`,
    };
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return {
      isValid: false,
      code: normalizedCode,
      discountAmount: 0,
      error: `Privilege voucher global quota has been exhausted`,
    };
  }

  // Minimum Order Value Check
  if (coupon.minOrderValue > 0 && subtotal < coupon.minOrderValue) {
    return {
      isValid: false,
      code: normalizedCode,
      discountAmount: 0,
      error: `Minimum order value of ₹${coupon.minOrderValue.toLocaleString(
        'en-IN'
      )} required for this privilege voucher`,
    };
  }

  // COD Restriction
  if (paymentMethod === 'COD' && !coupon.isCodAllowed) {
    return {
      isValid: false,
      code: normalizedCode,
      discountAmount: 0,
      error: `This voucher is applicable only for prepaid luxury payments (UPI / Cards)`,
    };
  }

  // User-specific validation (if registered user)
  if (userId) {
    // Per-User limit
    if (coupon.perUserLimit) {
      const userUsageCount = await prisma.couponUsage.count({
        where: { couponId: coupon.id, userId },
      });
      if (userUsageCount >= coupon.perUserLimit) {
        return {
          isValid: false,
          code: normalizedCode,
          discountAmount: 0,
          error: `You have already redeemed your allowance for voucher "${normalizedCode}"`,
        };
      }
    }

    // First order check
    if (coupon.isFirstOrderOnly) {
      const previousOrderCount = await prisma.order.count({
        where: { userId, status: { not: 'CANCELLED' } },
      });
      if (previousOrderCount > 0) {
        return {
          isValid: false,
          code: normalizedCode,
          discountAmount: 0,
          error: `Voucher is reserved exclusively for inaugural first-time acquisitions`,
        };
      }
    }
  }

  // Category / Brand / Product restrictions (if configured)
  let eligibleSubtotal = subtotal;

  if (coupon.applicableProductIds) {
    try {
      const allowedProdIds: string[] = JSON.parse(coupon.applicableProductIds);
      if (allowedProdIds.length > 0) {
        const eligibleItems = items.filter((i) => allowedProdIds.includes(i.productId));
        if (eligibleItems.length === 0) {
          return {
            isValid: false,
            code: normalizedCode,
            discountAmount: 0,
            error: `Voucher is not applicable to the items in your shopping bag`,
          };
        }
        eligibleSubtotal = eligibleItems.reduce((acc, i) => acc + i.totalPrice, 0);
      }
    } catch {}
  }

  // Calculate Discount Amount
  let discountAmount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discountAmount = Math.round((eligibleSubtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    // FLAT
    discountAmount = Math.min(coupon.discountValue, eligibleSubtotal);
  }

  return {
    isValid: true,
    code: normalizedCode,
    discountType: coupon.discountType as 'PERCENTAGE' | 'FLAT',
    discountValue: coupon.discountValue,
    discountAmount,
  };
}
