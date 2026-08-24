import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signCustomerToken, getCustomerCookieName } from '@/lib/auth';
import { customerLoginSchema } from '@/lib/validation';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = customerLoginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Invalid login credentials', 400, parsed.error.format());
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    if (user.status !== 'ACTIVE') {
      return errorResponse('Your account is currently disabled or suspended', 403);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse('Invalid email or password', 401);
    }

    const token = await signCustomerToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const response = successResponse({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      },
    });

    response.cookies.set({
      name: getCustomerCookieName(),
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Customer login error:', error);
    return errorResponse('Failed to sign in', 500);
  }
}
