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
  return bcrypt.compare(password, hash);
}

// Session Getters
export async function getCustomerSession() {
  const cookieStore = cookies();
  const token = cookieStore.get(getCustomerCookieName())?.value;
  if (!token) return null;

  const payload = await verifyCustomerToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
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

  if (!user || user.status !== 'ACTIVE') return null;

  return { user, payload };
}

export async function getAdminSession() {
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  if (!token) return null;

  const payload = await verifyAdminToken(token);
  if (!payload) return null;

  const admin = await prisma.adminUser.findUnique({
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

  if (!admin || admin.status !== 'ACTIVE') return null;

  const permissions =
    admin.role.slug === 'super-admin'
      ? ['*']
      : admin.role.permissions.map((rp) => rp.permission.code);

  return {
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
    payload,
  };
}
