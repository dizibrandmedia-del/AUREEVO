import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "canManageSuppliers")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const suppliers = await db.supplier.findMany({
      include: {
        _count: {
          select: { suppliedProducts: true, assignedOrders: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, suppliers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "canManageSuppliers")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      companyName,
      phone,
      whatsapp,
      email,
      gstin,
      address,
      city,
      state,
      pincode,
      deliveryArea,
      paymentTerms,
      returnTerms,
    } = body;

    if (!name || !companyName || !phone) {
      return NextResponse.json(
        { error: "Supplier name, company name, and phone number are required." },
        { status: 400 }
      );
    }

    const supplier = await db.supplier.create({
      data: {
        name,
        companyName,
        phone,
        whatsapp,
        email,
        gstin,
        address,
        city,
        state,
        pincode,
        deliveryArea: deliveryArea || "Pan-India",
        paymentTerms: paymentTerms || "30 Days Credit",
        returnTerms,
      },
    });

    return NextResponse.json({ success: true, supplier }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "canManageSuppliers")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      id,
      name,
      companyName,
      phone,
      whatsapp,
      email,
      gstin,
      address,
      city,
      state,
      pincode,
      deliveryArea,
      paymentTerms,
      returnTerms,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Supplier ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (companyName) updateData.companyName = companyName;
    if (phone) updateData.phone = phone;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (email !== undefined) updateData.email = email;
    if (gstin !== undefined) updateData.gstin = gstin;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (deliveryArea) updateData.deliveryArea = deliveryArea;
    if (paymentTerms) updateData.paymentTerms = paymentTerms;
    if (returnTerms !== undefined) updateData.returnTerms = returnTerms;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const supplier = await db.supplier.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, supplier });
  } catch (err: any) {
    console.error("Supplier update error:", err);
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
      return NextResponse.json({ error: "Supplier ID is required" }, { status: 400 });
    }

    // Check if supplier has assigned orders
    const orderCount = await db.order.count({ where: { supplierId: id } });
    if (orderCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete supplier: ${orderCount} orders are currently assigned to this supplier. Please reassign them first or deactivate this supplier.` },
        { status: 400 }
      );
    }

    await db.supplier.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Supplier deleted successfully" });
  } catch (err: any) {
    console.error("Supplier delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
