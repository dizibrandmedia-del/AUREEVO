import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { hashPassword } from '@/lib/auth';
import { logActivity } from '@/lib/activity-logger';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth('users.manage');
  if (!auth.authorized) return auth.response;

  try {
    const { name, roleId, status, password } = await req.json();

    const data: any = {};
    if (name) data.name = name;
    if (roleId) data.roleId = roleId;
    if (status) data.status = status;
    if (password && password.length >= 8) {
      data.passwordHash = await hashPassword(password);
    }

    const updated = await prisma.adminUser.update({
      where: { id: params.id },
      data,
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
      action: 'UPDATE_ADMIN_USER',
      entity: 'AdminUser',
      entityId: updated.id,
      metadata: { name: updated.name, status: updated.status, role: updated.role.name },
    });

    return successResponse({ user: updated });
  } catch (error: any) {
    console.error('Update admin user error:', error);
    return errorResponse('Failed to update admin user', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth('users.manage');
  if (!auth.authorized) return auth.response;

  try {
    // Prevent deleting self
    if (params.id === auth.admin?.id) {
      return errorResponse('You cannot delete your own admin account', 400);
    }

    const user = await prisma.adminUser.findUnique({ where: { id: params.id } });
    if (!user) return errorResponse('Admin user not found', 404);

    await prisma.adminUser.delete({ where: { id: params.id } });

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'DELETE_ADMIN_USER',
      entity: 'AdminUser',
      entityId: params.id,
      metadata: { email: user.email, name: user.name },
    });

    return successResponse({ message: 'Admin user deleted successfully' });
  } catch (error: any) {
    console.error('Delete admin user error:', error);
    return errorResponse('Failed to delete admin user', 500);
  }
}
