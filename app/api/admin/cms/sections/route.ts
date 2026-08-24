import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  const auth = await requireAdminAuth('settings.manage');
  if (!auth.authorized) return auth.response;

  try {
    const sections = await prisma.homepageSection.findMany({
      include: {
        banners: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return successResponse({ sections });
  } catch (err: any) {
    return errorResponse('Failed to fetch CMS sections', 500, err.message);
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdminAuth('settings.manage');
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { sectionId, isActive, sortOrder, title, subtitle, config } = body;

    if (!sectionId) return errorResponse('Section ID required', 400);

    const data: any = {};
    if (isActive !== undefined) data.isActive = isActive;
    if (sortOrder !== undefined) data.sortOrder = sortOrder;
    if (title !== undefined) data.title = title;
    if (subtitle !== undefined) data.subtitle = subtitle;
    if (config !== undefined) data.config = typeof config === 'string' ? config : JSON.stringify(config);

    const updated = await prisma.homepageSection.update({
      where: { id: sectionId },
      data,
    });

    return successResponse({ message: 'Homepage section updated', section: updated });
  } catch (err: any) {
    return errorResponse('Failed to update section', 500, err.message);
  }
}
