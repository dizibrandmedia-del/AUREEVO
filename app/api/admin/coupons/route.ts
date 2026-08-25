import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.authorized) return auth.response;

  try {
    const coupons = await prisma.coupon.findMany({
      include: {
        _count: { select: { usages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ coupons: coupons || [] });
  } catch (err: any) {
    console.error('Fetch coupons fallback:', err);
    return successResponse({ coupons: [] });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      minOrderValue = 0,
      maxDiscount,
      usageLimit,
      perUserLimit = 1,
      isFirstOrderOnly = false,
      isCodAllowed = true,
      startDate,
      expiryDate,
      isActive = true,
    } = body;

    if (!code || !name || !discountValue) {
      return errorResponse('Code, Name, and Discount Value are required', 400);
    }

    const existing = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (existing) {
      return errorResponse(`Coupon code "${code}" already exists`, 400);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        name,
        description,
        discountType: discountType || 'PERCENTAGE',
        discountValue: parseFloat(discountValue),
        minOrderValue: parseFloat(minOrderValue) || 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        perUserLimit: parseInt(perUserLimit, 10) || 1,
        isFirstOrderOnly: !!isFirstOrderOnly,
        isCodAllowed: isCodAllowed !== false,
        startDate: startDate ? new Date(startDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: !!isActive,
      },
    });

    return successResponse({ coupon });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to create coupon', 500);
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) return errorResponse('Coupon ID required', 400);

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        ...data,
        discountValue: data.discountValue ? parseFloat(data.discountValue) : undefined,
        minOrderValue: data.minOrderValue !== undefined ? parseFloat(data.minOrderValue) : undefined,
        maxDiscount: data.maxDiscount !== undefined ? (data.maxDiscount ? parseFloat(data.maxDiscount) : null) : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      },
    });

    return successResponse({ coupon: updated });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to update coupon', 500);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return errorResponse('Coupon ID required', 400);

    await prisma.coupon.delete({ where: { id } });
    return successResponse({ message: 'Coupon deleted' });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to delete coupon', 500);
  }
}
