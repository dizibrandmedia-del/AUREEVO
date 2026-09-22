import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const brands = await db.brand.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, brands });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN_MANAGER")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const { name, slug, logo, description, isFeatured } = body;

    const brand = await db.brand.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        logo,
        description,
        isFeatured: isFeatured || false,
      },
    });

    return NextResponse.json({ success: true, brand }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
