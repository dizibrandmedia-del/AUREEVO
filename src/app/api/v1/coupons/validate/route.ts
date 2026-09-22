import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { code, orderAmount } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Invalid or expired coupon code." }, { status: 400 });
    }

    const now = new Date();
    if (coupon.endDate < now) {
      return NextResponse.json({ error: "This coupon has expired." }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Coupon usage limit reached." }, { status: 400 });
    }

    if (orderAmount && orderAmount < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          error: `Coupon valid on orders of ₹${coupon.minOrderAmount.toLocaleString()} or more.`,
        },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      calculatedDiscount: Math.round(discountAmount),
      description: coupon.description,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
