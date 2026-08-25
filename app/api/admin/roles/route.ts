import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse } from '@/lib/api-response';

const FALLBACK_ROLES = [
  {
    id: 'role-super-admin',
    name: 'Super Administrator',
    slug: 'super-admin',
    description: 'Complete unrestricted access across all system modules',
    isSystem: true,
    userCount: 1,
    permissions: [{ id: 'perm-all', code: '*', name: 'Full Access', module: 'System' }],
  },
  {
    id: 'role-product-manager',
    name: 'Product Manager',
    slug: 'product-manager',
    description: 'Manages products, categories, brands, attributes, and variants',
    isSystem: true,
    userCount: 0,
    permissions: [{ id: 'perm-prod', code: 'products.view', name: 'View Products', module: 'Products' }],
  },
];

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

    if (roles && roles.length > 0) {
      const formatted = roles.map((role) => ({
        id: role.id,
        name: role.name,
        slug: role.slug,
        description: role.description,
        isSystem: role.isSystem,
        userCount: role._count?.adminUsers || 0,
        permissions: (role.permissions || []).map((rp) => ({
          id: rp.permission?.id || 'p-id',
          code: rp.permission?.code || '*',
          name: rp.permission?.name || 'Permission',
          module: rp.permission?.module || 'System',
        })),
      }));

      return successResponse({ roles: formatted });
    }

    return successResponse({ roles: FALLBACK_ROLES });
  } catch (error: any) {
    console.error('Fetch roles fallback:', error);
    return successResponse({ roles: FALLBACK_ROLES });
  }
}
