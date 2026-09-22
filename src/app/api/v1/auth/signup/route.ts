import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, signToken, logAudit } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body;

    // 1. Validation
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone?.trim() || `98${Math.floor(10000000 + Math.random() * 90000000)}`;

    // 2. Check if customer or staff user already exists with this email
    const existingCustomer = await db.customer.findUnique({
      where: { email: cleanEmail },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in." },
        { status: 400 }
      );
    }

    const existingStaff = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingStaff) {
      return NextResponse.json(
        { error: "This email is registered to a staff account. Please sign in." },
        { status: 400 }
      );
    }

    // 3. Check if phone is already taken
    if (phone?.trim()) {
      const existingPhone = await db.customer.findUnique({
        where: { phone: phone.trim() },
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: "An account with this phone number already exists." },
          { status: 400 }
        );
      }
    }

    // 4. Hash password & create Customer
    const passwordHash = await hashPassword(password);

    const customer = await db.customer.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        isVerified: true,
      },
    });

    const sessionUser = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      role: "CUSTOMER" as any,
      phone: customer.phone,
    };

    const token = signToken(sessionUser);

    await logAudit(
      "SIGNUP",
      "CUSTOMER",
      customer.id,
      { email: customer.email, name: customer.name },
      customer.id,
      customer.name
    );

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully.",
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
  } catch (err: any) {
    console.error("Signup API error:", err);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
