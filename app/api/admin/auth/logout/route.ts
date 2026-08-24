import { NextRequest } from 'next/server';
import { getAdminSession, getAdminCookieName } from '@/lib/auth';
import { logActivity } from '@/lib/activity-logger';
import { successResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (session && session.admin) {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await logActivity({
      adminUserId: session.admin.id,
      action: 'LOGOUT',
      entity: 'AdminAuth',
      entityId: session.admin.id,
      ipAddress: ip,
    });
  }

  const response = successResponse({ message: 'Logged out successfully' });
  response.cookies.set({
    name: getAdminCookieName(),
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
