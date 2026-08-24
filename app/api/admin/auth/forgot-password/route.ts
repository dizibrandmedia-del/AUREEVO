import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logActivity } from '@/lib/activity-logger';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return errorResponse('Email is required', 400);
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin) {
      // Return success to prevent email enumeration
      return successResponse({
        message: 'If the admin email exists in our records, a secure password reset token has been generated.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { resetToken, resetExpires },
    });

    await logActivity({
      adminUserId: admin.id,
      action: 'PASSWORD_RESET_REQUESTED',
      entity: 'AdminAuth',
      entityId: admin.id,
      metadata: { email: admin.email },
    });

    return successResponse({
      message: 'If the admin email exists in our records, a secure password reset token has been generated.',
      // In development mode, return token for testing convenience
      devToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse('Failed to process password reset request', 500);
  }
}
