import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logActivity } from '@/lib/activity-logger';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword || newPassword.length < 8) {
      return errorResponse('Valid reset token and password (min 8 characters) are required', 400);
    }

    const admin = await prisma.adminUser.findFirst({
      where: {
        resetToken: token,
        resetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!admin) {
      return errorResponse('Invalid or expired password reset token', 400);
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        passwordHash,
        resetToken: null,
        resetExpires: null,
      },
    });

    await logActivity({
      adminUserId: admin.id,
      action: 'PASSWORD_RESET_COMPLETED',
      entity: 'AdminAuth',
      entityId: admin.id,
    });

    return successResponse({ message: 'Password has been successfully updated' });
  } catch (error) {
    console.error('Reset password error:', error);
    return errorResponse('Failed to reset password', 500);
  }
}
