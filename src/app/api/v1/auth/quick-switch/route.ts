import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { UserRole } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  try {
    const { targetRole } = await req.json();

    if (targetRole === "CUSTOMER") {
      const customer = await db.customer.findFirst();
      if (!customer) {
        return NextResponse.json({ error: "No customer found" }, { status: 404 });
      }

      const sessionUser = {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        role: "CUSTOMER" as any,
        phone: customer.phone,
      };

      const token = signToken(sessionUser as any);
      const response = NextResponse.json({ success: true, user: sessionUser });
      response.cookies.set("aurevo_token", token, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    const user = await db.user.findFirst({
      where: { role: targetRole },
    });

    if (!user) {
      return NextResponse.json({ error: `No user with role ${targetRole}` }, { status: 404 });
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      phone: user.phone,
      avatar: user.avatar,
    };

    const token = signToken(sessionUser);
    const response = NextResponse.json({ success: true, user: sessionUser });
    response.cookies.set("aurevo_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
