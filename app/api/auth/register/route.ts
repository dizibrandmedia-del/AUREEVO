import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signCustomerToken, getCustomerCookieName } from '@/lib/auth';
import { customerRegisterSchema } from '@/lib/validation';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = customerRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Invalid registration data', 400, parsed.error.format());
    }

    const { email, password, firstName, lastName, phone } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return errorResponse('An account with this email already exists', 400);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        status: 'ACTIVE',
      },
    });

    const token = await signCustomerToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const response = successResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        },
      },
      201
    );

    response.cookies.set({
      name: getCustomerCookieName(),
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Customer registration error:', error);
    return errorResponse('Failed to create account', 500);
  }
}
