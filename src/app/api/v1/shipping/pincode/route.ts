import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get("pincode");

    if (!pincode || pincode.length !== 6) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit Indian PIN code." },
        { status: 400 }
      );
    }

    const pinRecord = await db.pincodeService.findUnique({
      where: { pincode },
    });

    if (pinRecord) {
      return NextResponse.json({
        success: true,
        serviceable: pinRecord.isDeliverable,
        city: pinRecord.city,
        state: pinRecord.state,
        deliveryCharge: pinRecord.deliveryCharge,
        estimatedDays: pinRecord.estimatedDays,
        codAvailable: pinRecord.isCodAvailable,
        installationAvailable: pinRecord.isInstallationAvailable,
      });
    }

    // Default pan-India fallback if not in explicit table
    return NextResponse.json({
      success: true,
      serviceable: true,
      city: "Standard Delivery Zone",
      state: "India",
      deliveryCharge: 199,
      estimatedDays: 4,
      codAvailable: true,
      installationAvailable: true,
      fallback: true,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
