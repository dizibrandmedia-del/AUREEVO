import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, logAudit } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (type && type !== "ALL") {
      where.type = type;
    }

    const returns = await db.returnRequest.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            orderStatus: true,
            grandTotal: true,
            createdAt: true,
            customerName: true,
            customerPhone: true,
            customerEmail: true,
            shippingAddressText: true,
            pincode: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, returns });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const { orderId, customerId, productId, type, reason, description, images } = body;

    if (!orderId || !reason) {
      return NextResponse.json({ error: "orderId and reason are required" }, { status: 400 });
    }

    // Lookup customer from order if not supplied
    let targetCustomerId = customerId;
    if (!targetCustomerId) {
      const order = await db.order.findUnique({ where: { id: orderId } });
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      targetCustomerId = order.customerId;
    }

    const returnRequest = await db.returnRequest.create({
      data: {
        orderId,
        customerId: targetCustomerId,
        productId: productId || "ALL",
        type: type || "RETURN",
        reason,
        description: description || "",
        images: images ? JSON.stringify(images) : null,
        status: "REQUESTED",
      },
    });

    if (user) {
      await logAudit(
        "CREATE_RETURN_REQUEST",
        "RETURN_REQUEST",
        returnRequest.id,
        returnRequest,
        user.id,
        user.name
      );
    }

    return NextResponse.json({ success: true, returnRequest }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, adminNotes } = body;

    if (!id) {
      return NextResponse.json({ error: "Return request id is required" }, { status: 400 });
    }

    const existing = await db.returnRequest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Return request not found" }, { status: 404 });
    }

    const updated = await db.returnRequest.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(adminNotes !== undefined ? { adminNotes } : {}),
      },
    });

    await logAudit(
      "UPDATE_RETURN_STATUS",
      "RETURN_REQUEST",
      id,
      { oldStatus: existing.status, newStatus: updated.status, adminNotes: updated.adminNotes },
      user.id,
      user.name
    );

    return NextResponse.json({ success: true, returnRequest: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
