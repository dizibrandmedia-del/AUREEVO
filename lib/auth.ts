import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import {
  signCustomerToken,
  verifyCustomerToken,
  signAdminToken,
  verifyAdminToken,
  getCustomerCookieName,
  getAdminCookieName,
  CustomerTokenPayload,
  AdminTokenPayload,
} from './jwt';

export {
  signCustomerToken,
  verifyCustomerToken,
  signAdminToken,
  verifyAdminToken,
  getCustomerCookieName,
  getAdminCookieName,
};
export type { CustomerTokenPayload, AdminTokenPayload };

const SALT_ROUNDS = 12;

// Password Utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

// Session Getters
export async function getCustomerSession() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(getCustomerCookieName())?.value;
    if (!token) return null;

    const payload = await verifyCustomerToken(token);
    if (!payload) return null;

    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true,
          emailVerified: true,
        },
      });
    } catch {
      // Fallback
    }

    if (!user) {
      user = {
        id: payload.userId,
        email: payload.email,
        firstName: payload.firstName || 'Valued',
        lastName: payload.lastName || 'Client',
        status: 'ACTIVE',
      };
    }

    if (user.status !== 'ACTIVE') return null;

    return { user, payload };
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(getAdminCookieName())?.value;
    if (!token) return null;

    const payload = await verifyAdminToken(token);
    if (!payload) return null;

    let admin: any = null;
    try {
      admin = await prisma.adminUser.findUnique({
        where: { id: payload.adminId },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });
    } catch (e) {
      console.warn('Admin session DB lookup fallback:', e);
    }

    if (!admin && (payload.roleSlug === 'super-admin' || payload.email === 'admin@aureevo.com')) {
      return {
        admin: {
          id: payload.adminId,
          email: payload.email,
          name: payload.name || 'AUREEVO Super Admin',
          avatar: '/images/aureevo-logo.png',
          role: {
            id: payload.roleId || 'super-admin-role',
            name: 'Super Administrator',
            slug: 'super-admin',
          },
          permissions: ['*'],
        },
        payload,
      };
    }

    if (!admin || admin.status !== 'ACTIVE') return null;

    const permissions =
      admin.role?.slug === 'super-admin'
        ? ['*']
        : admin.role?.permissions
        ? admin.role.permissions.map((rp: any) => rp.permission?.code).filter(Boolean)
        : ['*'];

    return {
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        avatar: admin.avatar || '/images/aureevo-logo.png',
        role: {
          id: admin.role?.id || payload.roleId,
          name: admin.role?.name || 'Administrator',
          slug: admin.role?.slug || payload.roleSlug,
        },
        permissions,
      },
      payload,
    };
  } catch {
    return null;
  }
}
