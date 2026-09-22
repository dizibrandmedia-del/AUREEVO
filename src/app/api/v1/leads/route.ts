import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "LISTING_EXECUTIVE" || user.role === "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized access to CRM leads" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const leads = await db.lead.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        activities: { orderBy: { createdAt: "desc" } },
        quotations: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, leads });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      phone,
      email,
      city,
      leadSource,
      productName,
      quantity,
      budgetRange,
      requirement,
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Customer name and mobile number are required." },
        { status: 400 }
      );
    }

    // Auto-assign to an active sales manager or sales user
    const salesUser = await db.user.findFirst({
      where: { role: "SALES_MANAGER", isActive: true },
    });

    const lead = await db.lead.create({
      data: {
        name,
        phone,
        email: email || null,
        city: city || null,
        leadSource: leadSource || "WEBSITE_PRODUCT",
        productName: productName || null,
        quantity: quantity ? parseInt(quantity, 10) : 1,
        budgetRange: budgetRange || null,
        requirement: requirement || null,
        status: "NEW",
        assignedToId: salesUser?.id || null,
        activities: {
          create: [
            {
              type: "STATUS_CHANGE",
              summary: "Lead Captured",
              details: `Lead submitted via ${leadSource || "Website"}. Requirement: ${requirement || productName || "General enquiry"}`,
              conductedBy: "System",
            },
          ],
        },
      },
      include: {
        assignedTo: true,
      },
    });

    return NextResponse.json({
      success: true,
      lead,
      message: "Your enquiry has been received! Our product specialist will contact you shortly.",
    });
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
    const { id, status, stage, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Lead id is required" }, { status: 400 });
    }

    const newStatus = status || stage;

    const lead = await db.lead.update({
      where: { id },
      data: {
        ...(newStatus ? { status: newStatus } : {}),
        ...(notes
          ? {
              activities: {
                create: {
                  type: "NOTE",
                  summary: "Sales Follow-up",
                  details: notes,
                  conductedBy: user.name || "Sales Executive",
                },
              },
            }
          : {}),
      },
      include: {
        assignedTo: true,
        activities: { orderBy: { createdAt: "desc" } },
      },
    });

    return NextResponse.json({ success: true, lead });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

