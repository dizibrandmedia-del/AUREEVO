import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, signToken, logAudit } from "@/lib/auth";
import { UserRole } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, roleHint } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // 1. Check in User table (Admin, Sales, Listing)
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (user && user.isActive) {
      const isValid = await comparePassword(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
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

      await logAudit(
        "LOGIN",
        "USER",
        user.id,
        { email: user.email, role: user.role },
        user.id,
        user.name
      );

      const response = NextResponse.json({
        success: true,
        user: sessionUser,
        token,
      });

      response.cookies.set("aurevo_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    // 2. Check in Customer table
    const customer = await db.customer.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (customer && customer.passwordHash) {
      const isValid = await comparePassword(password, customer.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }

      const customerUser = {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        role: "CUSTOMER" as any,
        phone: customer.phone,
      };

      const token = signToken(customerUser as any);

      const response = NextResponse.json({
        success: true,
        user: customerUser,
        token,
      });

      response.cookies.set("aurevo_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    return NextResponse.json(
      { error: "Account not found with provided credentials." },
      { status: 401 }
    );
  } catch (err: any) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { error: "Internal server error during authentication." },
      { status: 500 }
    );
  }
}
