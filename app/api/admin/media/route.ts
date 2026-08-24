import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { logActivity } from '@/lib/activity-logger';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth('media.view');
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder');
    const search = searchParams.get('search') || '';

    const where: any = {};
    if (folder && folder !== 'all') where.folder = folder;
    if (search) {
      where.OR = [
        { originalName: { contains: search } },
        { filename: { contains: search } },
        { altText: { contains: search } },
      ];
    }

    const media = await prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ media });
  } catch (error: any) {
    console.error('Fetch media error:', error);
    return errorResponse('Failed to fetch media assets', 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth('media.upload');
  if (!auth.authorized) return auth.response;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';
    const altText = (formData.get('altText') as string) || null;

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return errorResponse(
        `Invalid file type: ${file.type}. Allowed formats are JPG, PNG, WEBP, GIF, SVG, MP4, and WEBM.`,
        400
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse('File exceeds the maximum allowed size of 15MB', 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique sanitized filename
    const ext = path.extname(file.name) || (file.type === 'image/png' ? '.png' : '.jpg');
    const hash = crypto.randomBytes(8).toString('hex');
    const sanitizedOriginal = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase()
      .replace(ext, '');
    const filename = `${sanitizedOriginal}_${hash}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    const media = await prisma.media.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: publicUrl,
        altText: altText || file.name,
        folder,
      },
    });

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'UPLOAD_MEDIA',
      entity: 'Media',
      entityId: media.id,
      metadata: { filename: media.filename, size: media.size, mimeType: media.mimeType },
    });

    return successResponse({ media }, 201);
  } catch (error: any) {
    console.error('Media upload error:', error);
    return errorResponse(error.message || 'Failed to upload media', 500);
  }
}
