import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const packages = await db.weddingPackage.findMany({
      where: { isActive: true },
      orderBy: { packagePrice: "asc" },
    });

    const parsedPackages = packages.map((pkg) => ({
      ...pkg,
      items: JSON.parse(pkg.itemsJson || "[]"),
    }));

    return NextResponse.json({ success: true, packages: parsedPackages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
