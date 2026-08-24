import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { attributeSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { logActivity } from '@/lib/activity-logger';

export async function GET() {
  const auth = await requireAdminAuth('attributes.view');
  if (!auth.authorized) return auth.response;

  try {
    const attributes = await prisma.attribute.findMany({
      include: {
        values: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return successResponse({ attributes });
  } catch (error: any) {
    console.error('Fetch attributes error:', error);
    return errorResponse('Failed to fetch attributes', 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth('attributes.manage');
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const parsed = attributeSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Invalid attribute data', 400, parsed.error.format());
    }

    const { name, code, type, isFilterable, isVariant, isRequired, sortOrder } = parsed.data;

    const formattedCode = slugify(code).replace(/-/g, '_');

    const existing = await prisma.attribute.findUnique({
      where: { code: formattedCode },
    });

    if (existing) {
      return errorResponse('An attribute with this code already exists', 400);
    }

    const attribute = await prisma.attribute.create({
      data: {
        name,
        code: formattedCode,
        type,
        isFilterable,
        isVariant,
        isRequired,
        sortOrder,
      },
      include: { values: true },
    });

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'CREATE',
      entity: 'Attribute',
      entityId: attribute.id,
      metadata: { name: attribute.name, code: attribute.code, type: attribute.type },
    });

    return successResponse({ attribute }, 201);
  } catch (error: any) {
    console.error('Create attribute error:', error);
    return errorResponse('Failed to create attribute', 500);
  }
}
