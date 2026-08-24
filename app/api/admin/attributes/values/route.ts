import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { attributeValueSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { logActivity } from '@/lib/activity-logger';

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth('attributes.manage');
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const parsed = attributeValueSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Invalid attribute value data', 400, parsed.error.format());
    }

    const { attributeId, value, label, hexColor, sortOrder } = parsed.data;
    const formattedValue = slugify(value);

    const existing = await prisma.attributeValue.findUnique({
      where: {
        attributeId_value: {
          attributeId,
          value: formattedValue,
        },
      },
    });

    if (existing) {
      return errorResponse('This value already exists for this attribute', 400);
    }

    const attrVal = await prisma.attributeValue.create({
      data: {
        attributeId,
        value: formattedValue,
        label,
        hexColor,
        sortOrder,
      },
    });

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'ADD_VALUE',
      entity: 'AttributeValue',
      entityId: attrVal.id,
      metadata: { attributeId, value: attrVal.value, label: attrVal.label },
    });

    return successResponse({ value: attrVal }, 201);
  } catch (error: any) {
    console.error('Create attribute value error:', error);
    return errorResponse('Failed to create attribute value', 500);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminAuth('attributes.manage');
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return errorResponse('Value ID is required', 400);

    const val = await prisma.attributeValue.findUnique({ where: { id } });
    if (!val) return errorResponse('Attribute value not found', 404);

    await prisma.attributeValue.delete({ where: { id } });

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'DELETE_VALUE',
      entity: 'AttributeValue',
      entityId: id,
      metadata: { value: val.value, label: val.label },
    });

    return successResponse({ message: 'Attribute value deleted successfully' });
  } catch (error: any) {
    console.error('Delete attribute value error:', error);
    return errorResponse('Failed to delete attribute value', 500);
  }
}
