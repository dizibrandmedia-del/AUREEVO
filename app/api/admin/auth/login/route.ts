import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signAdminToken, getAdminCookieName } from '@/lib/auth';
import { adminLoginSchema } from '@/lib/validation';
import { logActivity } from '@/lib/activity-logger';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = adminLoginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Invalid input data', 400, parsed.error.format());
    }

    const { email, password } = parsed.data;

    const admin = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!admin) {
      return errorResponse('Invalid credentials', 401);
    }

    if (admin.status !== 'ACTIVE') {
      return errorResponse('This admin account has been suspended or deactivated', 403);
    }

    const isMatch = await comparePassword(password, admin.passwordHash);
    if (!isMatch) {
      return errorResponse('Invalid credentials', 401);
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT
    const token = await signAdminToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      roleId: admin.roleId,
      roleSlug: admin.role.slug,
    });

    // Log Activity
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    await logActivity({
      adminUserId: admin.id,
      action: 'LOGIN',
      entity: 'AdminAuth',
      entityId: admin.id,
      metadata: { email: admin.email, role: admin.role.name },
      ipAddress: ip,
      userAgent,
    });

    const permissions = admin.role.permissions.map((rp) => rp.permission.code);

    const response = successResponse({
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        avatar: admin.avatar,
        role: {
          id: admin.role.id,
          name: admin.role.name,
          slug: admin.role.slug,
        },
        permissions,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: getAdminCookieName(),
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error: any) {
    console.error('Admin login error:', error);
    return errorResponse('Internal server error during admin login', 500);
  }
}
