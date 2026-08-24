import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { hashPassword } from '@/lib/auth';
import { logActivity } from '@/lib/activity-logger';

export async function GET() {
  const auth = await requireAdminAuth('users.manage');
  if (!auth.authorized) return auth.response;

  try {
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        avatar: true,
        lastLoginAt: true,
        createdAt: true,
        role: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ users });
  } catch (error: any) {
    console.error('Fetch admin users error:', error);
    return errorResponse('Failed to fetch admin users', 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth('users.manage');
  if (!auth.authorized) return auth.response;

  try {
    const { email, password, name, roleId } = await req.json();

    if (!email || !password || !name || !roleId) {
      return errorResponse('All fields (email, password, name, role) are required', 400);
    }

    if (password.length < 8) {
      return errorResponse('Password must be at least 8 characters long', 400);
    }

    const existing = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return errorResponse('An admin user with this email already exists', 400);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.adminUser.create({
      data: {
        email: email.toLowerCase().trim(),
        name,
        passwordHash,
        roleId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        role: { select: { id: true, name: true, slug: true } },
      },
    });

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'CREATE_ADMIN_USER',
      entity: 'AdminUser',
      entityId: user.id,
      metadata: { email: user.email, name: user.name, role: user.role.name },
    });

    return successResponse({ user }, 201);
  } catch (error: any) {
    console.error('Create admin user error:', error);
    return errorResponse('Failed to create admin user', 500);
  }
}
