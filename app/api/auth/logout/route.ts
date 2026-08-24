import { getCustomerCookieName } from '@/lib/auth';
import { successResponse } from '@/lib/api-response';

export async function POST() {
  const response = successResponse({ message: 'Customer session terminated' });
  response.cookies.set({
    name: getCustomerCookieName(),
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
