import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, logAudit } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const order = await db.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
        shipments: { orderBy: { createdAt: "desc" } },
        supplier: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "canManageOrders")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { orderStatus, fulfilmentModel, supplierId, notes, shipmentStatus, trackingNumber, courierName } = body;

    const updateData: any = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (fulfilmentModel) updateData.fulfilmentModel = fulfilmentModel;
    if (supplierId !== undefined) updateData.supplierId = supplierId;
    if (notes !== undefined) updateData.notes = notes;

    const order = await db.order.update({
      where: { id },
      data: updateData,
    });

    // If updating or adding shipment details
    if (shipmentStatus || trackingNumber) {
      await db.shipment.create({
        data: {
          orderId: id,
          status: shipmentStatus || "IN_TRANSIT",
          trackingNumber: trackingNumber || `TRK-${Date.now().toString().slice(-6)}`,
          courierName: courierName || "AUREVO Fleet Delivery",
          shippedAt: new Date(),
          notes: notes || `Order updated to ${orderStatus || shipmentStatus}`,
        },
      });
    }

    await logAudit(
      "UPDATE_ORDER",
      "ORDER",
      id,
      { orderStatus, fulfilmentModel, supplierId },
      user.id,
      user.name
    );

    return NextResponse.json({
      success: true,
      order,
      message: "Order fulfilment updated successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
