import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  const auth = await requireAdminAuth('users.manage');
  if (!auth.authorized) return auth.response;

  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: { select: { adminUsers: true } },
      },
      orderBy: { name: 'asc' },
    });

    const formatted = roles.map((role) => ({
      id: role.id,
      name: role.name,
      slug: role.slug,
      description: role.description,
      isSystem: role.isSystem,
      userCount: role._count.adminUsers,
      permissions: role.permissions.map((rp) => ({
        id: rp.permission.id,
        code: rp.permission.code,
        name: rp.permission.name,
        module: rp.permission.module,
      })),
    }));

    return successResponse({ roles: formatted });
  } catch (error: any) {
    console.error('Fetch roles error:', error);
    return errorResponse('Failed to fetch roles', 500);
  }
}
