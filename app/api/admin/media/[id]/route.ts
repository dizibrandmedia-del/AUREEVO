import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { logActivity } from '@/lib/activity-logger';
import path from 'path';
import fs from 'fs/promises';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth('media.upload');
  if (!auth.authorized) return auth.response;

  try {
    const media = await prisma.media.findUnique({ where: { id: params.id } });
    if (!media) return errorResponse('Media asset not found', 404);

    // Remove from disk if file is in uploads directory
    if (media.url.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', media.url);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn('Could not delete file from disk (might not exist):', filePath);
      }
    }

    await prisma.media.delete({ where: { id: params.id } });

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'DELETE_MEDIA',
      entity: 'Media',
      entityId: params.id,
      metadata: { filename: media.filename },
    });

    return successResponse({ message: 'Media asset deleted successfully' });
  } catch (error: any) {
    console.error('Delete media error:', error);
    return errorResponse('Failed to delete media asset', 500);
  }
}
