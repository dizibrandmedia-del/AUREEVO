import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { attributeSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { logActivity } from '@/lib/activity-logger';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth('attributes.view');
  if (!auth.authorized) return auth.response;

  try {
    const attribute = await prisma.attribute.findUnique({
      where: { id: params.id },
      include: {
        values: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { productAttributes: true } },
      },
    });

    if (!attribute) return errorResponse('Attribute not found', 404);
    return successResponse({ attribute });
  } catch (error) {
    return errorResponse('Failed to fetch attribute', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

    const existing = await prisma.attribute.findFirst({
      where: { code: formattedCode, NOT: { id: params.id } },
    });

    if (existing) {
      return errorResponse('Another attribute with this code already exists', 400);
    }

    const attribute = await prisma.attribute.update({
      where: { id: params.id },
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
      action: 'UPDATE',
      entity: 'Attribute',
      entityId: attribute.id,
      metadata: { name: attribute.name, code: attribute.code },
    });

    return successResponse({ attribute });
  } catch (error: any) {
    console.error('Update attribute error:', error);
    return errorResponse('Failed to update attribute', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth('attributes.manage');
  if (!auth.authorized) return auth.response;

  try {
    const existing = await prisma.attribute.findUnique({
      where: { id: params.id },
      include: { _count: { select: { productAttributes: true } } },
    });

    if (!existing) return errorResponse('Attribute not found', 404);

    if (existing._count.productAttributes > 0) {
      return errorResponse(
        `Cannot delete attribute: Used in ${existing._count.productAttributes} product specification(s).`,
        400
      );
    }

    await prisma.attribute.delete({
      where: { id: params.id },
    });

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'DELETE',
      entity: 'Attribute',
      entityId: params.id,
      metadata: { name: existing.name, code: existing.code },
    });

    return successResponse({ message: 'Attribute deleted successfully' });
  } catch (error: any) {
    console.error('Delete attribute error:', error);
    return errorResponse('Failed to delete attribute', 500);
  }
}
