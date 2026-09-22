import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    const coupons = await db.coupon.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, coupons });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN_MANAGER")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      startDate,
      endDate,
      isActive,
    } = body;

    if (!code || !discountValue || !endDate) {
      return NextResponse.json(
        { error: "Coupon code, discount value, and expiry date are required." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Check unique code
    const existing = await db.coupon.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return NextResponse.json({ error: `Coupon code '${cleanCode}' already exists.` }, { status: 400 });
    }

    const coupon = await db.coupon.create({
      data: {
        code: cleanCode,
        description: description || `Special discount code ${cleanCode}`,
        discountType: discountType || "PERCENTAGE",
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : 1000,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (err: any) {
    console.error("Coupon create error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN_MANAGER")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const {
      id,
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      startDate,
      endDate,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (code) updateData.code = code.trim().toUpperCase();
    if (description !== undefined) updateData.description = description;
    if (discountType) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = parseFloat(discountValue);
    if (minOrderAmount !== undefined) updateData.minOrderAmount = parseFloat(minOrderAmount);
    if (maxDiscountAmount !== undefined) updateData.maxDiscountAmount = maxDiscountAmount ? parseFloat(maxDiscountAmount) : null;
    if (usageLimit !== undefined) updateData.usageLimit = parseInt(usageLimit, 10);
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const coupon = await db.coupon.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, coupon });
  } catch (err: any) {
    console.error("Coupon update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Super Admin privileges required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    await db.coupon.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
  } catch (err: any) {
    console.error("Coupon delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
