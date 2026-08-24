import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'aureevo_super_secure_luxury_secret_jwt_key_2026'
);

const CUSTOMER_COOKIE_NAME = 'aureevo_customer_token';
const ADMIN_COOKIE_NAME = 'aureevo_admin_token';

// Customer Tokens
export interface CustomerTokenPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  type: 'customer';
}

export async function signCustomerToken(payload: Omit<CustomerTokenPayload, 'type'>): Promise<string> {
  return new SignJWT({ ...payload, type: 'customer' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyCustomerToken(token: string): Promise<CustomerTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== 'customer') return null;
    return payload as unknown as CustomerTokenPayload;
  } catch {
    return null;
  }
}

// Admin Tokens
export interface AdminTokenPayload {
  adminId: string;
  email: string;
  name: string;
  roleId: string;
  roleSlug: string;
  type: 'admin';
}

export async function signAdminToken(payload: Omit<AdminTokenPayload, 'type'>): Promise<string> {
  return new SignJWT({ ...payload, type: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== 'admin') return null;
    return payload as unknown as AdminTokenPayload;
  } catch {
    return null;
  }
}

export function getAdminCookieName() {
  return ADMIN_COOKIE_NAME;
}

export function getCustomerCookieName() {
  return CUSTOMER_COOKIE_NAME;
}
