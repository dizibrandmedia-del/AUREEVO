import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, logAudit } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { calculateMargin } from "@/lib/margin";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "canViewPurchaseCost")) {
      return NextResponse.json({ error: "Unauthorized access to sensitive pricing margins" }, { status: 403 });
    }

    const categories = await db.category.findMany({
      include: {
        marginRule: true,
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            mrp: true,
            purchasePrice: true,
            sellingPrice: true,
            stock: true,
          },
        },
      },
    });

    const categoryReports = categories.map((cat) => {
      const rule = cat.marginRule || {
        minMarginPercent: 10,
        defaultMarginPercent: 15,
        otherCostPercent: 3,
      };

      const productAnalytics = cat.products.map((p) => {
        const marginCalc = calculateMargin(
          p.sellingPrice,
          p.purchasePrice,
          rule.otherCostPercent
        );
        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          mrp: p.mrp,
          stock: p.stock,
          ...marginCalc,
        };
      });

      const avgNetMarginPercent =
        productAnalytics.length > 0
          ? productAnalytics.reduce((s, p) => s + p.netMarginPercent, 0) / productAnalytics.length
          : 0;

      const totalInventoryValue = productAnalytics.reduce(
        (s, p) => s + p.sellingPrice * p.stock,
        0
      );

      const totalPurchaseValue = productAnalytics.reduce(
        (s, p) => s + p.purchaseCost * p.stock,
        0
      );

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        slug: cat.slug,
        rule,
        productCount: cat.products.length,
        avgNetMarginPercent: Number(avgNetMarginPercent.toFixed(2)),
        totalInventoryValue,
        totalPurchaseValue,
        projectedGrossProfit: totalInventoryValue - totalPurchaseValue,
        products: productAnalytics,
      };
    });

    return NextResponse.json({ success: true, categories: categoryReports });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "canManageMargins")) {
      return NextResponse.json({ error: "Unauthorized to update margin rules" }, { status: 403 });
    }

    const body = await req.json();
    const { categoryId, minMarginPercent, defaultMarginPercent, otherCostPercent, notes } = body;

    const rule = await db.categoryMarginRule.upsert({
      where: { categoryId },
      update: {
        minMarginPercent: parseFloat(minMarginPercent),
        defaultMarginPercent: parseFloat(defaultMarginPercent),
        otherCostPercent: parseFloat(otherCostPercent),
        notes,
      },
      create: {
        categoryId,
        minMarginPercent: parseFloat(minMarginPercent),
        defaultMarginPercent: parseFloat(defaultMarginPercent),
        otherCostPercent: parseFloat(otherCostPercent),
        notes,
      },
    });

    await logAudit("UPDATE_MARGIN_RULE", "MARGIN", categoryId, body, user.id, user.name);

    return NextResponse.json({ success: true, rule, message: "Category margin rules updated." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
