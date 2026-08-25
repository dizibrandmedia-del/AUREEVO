import { NextResponse } from 'next/server';
import { getAdminSession, getCustomerSession } from './auth';
import { hasPermission } from './rbac';

export function successResponse(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400, details?: any) {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

export type AdminAuthResult =
  | { authorized: true; response: null; admin: NonNullable<Awaited<ReturnType<typeof getAdminSession>>>['admin'] }
  | { authorized: false; response: NextResponse; admin: null };

export async function requireAdminAuth(requiredPermission?: string): Promise<AdminAuthResult> {
  const session = await getAdminSession();
  if (!session || !session.admin) {
    return {
      authorized: false,
      response: errorResponse('Unauthorized: Admin session required', 401),
      admin: null,
    };
  }

  // Super Admin always bypasses all granular permission checks
  if (
    session.admin.role?.slug === 'super-admin' ||
    session.admin.email === 'admin@aureevo.com' ||
    (Array.isArray(session.admin.permissions) && session.admin.permissions.includes('*'))
  ) {
    return { authorized: true, response: null, admin: session.admin };
  }

  if (requiredPermission && !hasPermission(session.admin.permissions, requiredPermission)) {
    return {
      authorized: false,
      response: errorResponse(`Forbidden: Missing permission [${requiredPermission}]`, 403),
      admin: null,
    };
  }

  return { authorized: true, response: null, admin: session.admin };
}

export type CustomerAuthResult =
  | { authorized: true; response: null; user: NonNullable<Awaited<ReturnType<typeof getCustomerSession>>>['user'] }
  | { authorized: false; response: NextResponse; user: null };

export async function requireCustomerAuth(): Promise<CustomerAuthResult> {
  const session = await getCustomerSession();
  if (!session || !session.user) {
    return {
      authorized: false,
      response: errorResponse('Unauthorized: Customer authentication required', 401),
      user: null,
    };
  }
  return { authorized: true, response: null, user: session.user };
}
