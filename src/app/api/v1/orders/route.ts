import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, logAudit } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get("orderNumber");
    const status = searchParams.get("status");

    // If order tracking by public orderNumber
    if (orderNumber) {
      const order = await db.order.findUnique({
        where: { orderNumber },
        include: {
          items: true,
          shipments: { orderBy: { createdAt: "desc" } },
        },
      });
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, order });
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where: any = {};
    if (user.role === "CUSTOMER") {
      where.customerId = user.id;
    } else if (status) {
      where.orderStatus = status;
    }

    const orders = await db.order.findMany({
      where,
      include: {
        items: true,
        shipments: { orderBy: { createdAt: "desc" } },
        supplier: { select: { id: true, name: true, companyName: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      pincode,
      items,
      paymentMethod,
      couponCode,
      couponDiscount,
      deliveryCharge,
      installationCharge,
    } = body;

    if (!customerName || !customerPhone || !shippingAddress || !pincode || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required order information." },
        { status: 400 }
      );
    }

    // Verify items and compute subtotal, MRP total, and taxes
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await db.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let totalMrp = 0;
    let subtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const dbProd = productMap.get(item.productId);
      if (!dbProd) continue;

      const qty = item.quantity || 1;
      const unitMrp = dbProd.mrp;
      const unitSelling = dbProd.sellingPrice;
      const unitCost = dbProd.purchasePrice;
      const itemTotal = unitSelling * qty;

      totalMrp += unitMrp * qty;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: dbProd.id,
        productName: dbProd.name,
        productSku: dbProd.sku,
        productImage: item.image || "",
        quantity: qty,
        unitMrp,
        unitSellingPrice: unitSelling,
        unitPurchaseCost: unitCost,
        unitGstPercent: dbProd.gstPercent,
        total: itemTotal,
        installationRequired: item.addInstallation || false,
        installationCost: item.addInstallation ? (dbProd.installationCost || 0) : 0,
      });

      // Decrement stock
      await db.product.update({
        where: { id: dbProd.id },
        data: { stock: { decrement: qty } },
      });
    }

    const appliedDiscount = couponDiscount ? parseFloat(couponDiscount) : 0;
    const appliedDelivery = deliveryCharge ? parseFloat(deliveryCharge) : 0;
    const appliedInstall = installationCharge ? parseFloat(installationCharge) : 0;
    const grandTotal = Math.max(0, subtotal - appliedDiscount + appliedDelivery + appliedInstall);
    const gstAmount = Math.round((grandTotal * 18) / 118);

    const orderNumber = `AUR-ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;

    // Default supplier (first active supplier)
    const defaultSupplier = await db.supplier.findFirst({ where: { isActive: true } });

    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: user?.role === "CUSTOMER" ? user.id : null,
        customerName,
        customerPhone,
        customerEmail: customerEmail || "",
        shippingAddressText: shippingAddress,
        pincode,
        totalMrp,
        subtotal,
        totalDiscount: totalMrp - subtotal,
        couponCode: couponCode || null,
        couponDiscount: appliedDiscount,
        deliveryCharge: appliedDelivery,
        installationCharge: appliedInstall,
        gstAmount,
        grandTotal,
        paymentStatus: paymentMethod === "COD" ? "PENDING" : "PAID",
        paymentMethod: paymentMethod || "RAZORPAY",
        orderStatus: "CONFIRMED",
        fulfilmentModel: "LOCAL_SUPPLIER_LOCAL_DELIVERY",
        supplierId: defaultSupplier?.id || null,
        invoiceNumber,
        items: {
          create: orderItemsData,
        },
        shipments: {
          create: [
            {
              courierName: "AUREVO Express Priority",
              trackingNumber: `TRK-${Date.now().toString().slice(-8)}`,
              status: "MANIFESTED",
              estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
              notes: "Order confirmed and assigned to fulfilment centre.",
            },
          ],
        },
      },
      include: {
        items: true,
        shipments: true,
      },
    });

    if (user) {
      await logAudit("CREATE_ORDER", "ORDER", order.id, { orderNumber, grandTotal }, user.id, user.name);
    }

    return NextResponse.json({
      success: true,
      order,
      orderNumber,
      message: "Order placed successfully!",
    }, { status: 201 });
  } catch (err: any) {
    console.error("Order creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
