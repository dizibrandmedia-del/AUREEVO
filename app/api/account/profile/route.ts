import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCustomerSession, hashPassword, comparePassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session || !session.user) {
      return errorResponse('Authentication required', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        createdAt: true,
        addresses: true,
      },
    });

    return successResponse({ user });
  } catch (err: any) {
    return errorResponse('Failed to load profile', 500, err.message);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCustomerSession();
    if (!session || !session.user) {
      return errorResponse('Authentication required', 401);
    }

    const body = await req.json();
    const { firstName, lastName, phone, currentPassword, newPassword } = body;

    const dataToUpdate: any = {};
    if (firstName) dataToUpdate.firstName = firstName.trim();
    if (lastName) dataToUpdate.lastName = lastName.trim();
    if (phone !== undefined) dataToUpdate.phone = phone ? phone.trim() : null;

    if (newPassword) {
      if (!currentPassword) {
        return errorResponse('Current password required to authorize password change', 400);
      }
      if (newPassword.length < 8) {
        return errorResponse('New password must be at least 8 characters', 400);
      }

      const currentUser = await prisma.user.findUniqueOrThrow({
        where: { id: session.user.id },
      });

      const isMatch = await comparePassword(currentPassword, currentUser.passwordHash);
      if (!isMatch) {
        return errorResponse('Current password does not match records', 400);
      }

      dataToUpdate.passwordHash = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });

    return successResponse({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (err: any) {
    return errorResponse('Failed to update profile', 500, err.message);
  }
}
