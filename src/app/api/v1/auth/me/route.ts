import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ROLE_PERMISSIONS, UserRole } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const permissions =
      user.role in ROLE_PERMISSIONS
        ? ROLE_PERMISSIONS[user.role as UserRole]
        : null;

    return NextResponse.json({
      authenticated: true,
      user,
      permissions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error checking session", authenticated: false },
      { status: 500 }
    );
  }
}
