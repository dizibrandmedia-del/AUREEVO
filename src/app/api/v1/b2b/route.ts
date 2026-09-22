import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyName,
      contactPerson,
      phone,
      email,
      city,
      businessType,
      products,
      quantity,
      requirement,
    } = body;

    if (!companyName || !contactPerson || !phone || !products) {
      return NextResponse.json(
        { error: "Company name, contact person, mobile number, and products required." },
        { status: 400 }
      );
    }

    const b2b = await db.b2BEnquiry.create({
      data: {
        companyName,
        contactPerson,
        phone,
        email: email || "",
        city: city || "",
        businessType: businessType || "Corporate Office",
        products,
        quantity: quantity ? parseInt(quantity, 10) : 1,
        requirement: requirement || null,
        status: "PENDING",
      },
    });

    // Also push a lead into Sales CRM
    const salesUser = await db.user.findFirst({
      where: { role: "SALES_MANAGER", isActive: true },
    });

    await db.lead.create({
      data: {
        name: `${contactPerson} (${companyName})`,
        phone,
        email,
        city,
        leadSource: "B2B_CORPORATE",
        productName: `B2B Bulk: ${products} (Qty: ${quantity || 1})`,
        quantity: quantity ? parseInt(quantity, 10) : 1,
        requirement: `Business Type: ${businessType}. Requirement: ${requirement || "Bulk pricing requested"}`,
        status: "NEW",
        assignedToId: salesUser?.id || null,
      },
    });

    return NextResponse.json({
      success: true,
      b2b,
      message: "B2B Corporate inquiry submitted successfully. An enterprise account manager will contact you within 2 business hours.",
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
