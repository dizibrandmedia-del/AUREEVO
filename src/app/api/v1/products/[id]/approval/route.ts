import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, logAudit } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "canApproveProducts")) {
      return NextResponse.json(
        { error: "Unauthorized. Product approval requires Admin permissions." },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { action, rejectionReason } = body; // APPROVE, REJECT, PUBLISH, UNPUBLISH

    let targetStatus = "APPROVED";
    if (action === "REJECT") {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: "A rejection reason is mandatory when rejecting a product." },
          { status: 400 }
        );
      }
      targetStatus = "REJECTED";
    } else if (action === "PUBLISH" || action === "APPROVE") {
      targetStatus = "PUBLISHED";
    } else if (action === "UNPUBLISH") {
      targetStatus = "DRAFT";
    }

    const updated = await db.product.update({
      where: { id },
      data: {
        status: targetStatus,
        rejectionReason: action === "REJECT" ? rejectionReason : null,
      },
    });

    await logAudit(
      `PRODUCT_${action}`,
      "PRODUCT",
      id,
      { status: targetStatus, reason: rejectionReason },
      user.id,
      user.name
    );

    return NextResponse.json({
      success: true,
      product: updated,
      message: `Product status updated to ${targetStatus}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
