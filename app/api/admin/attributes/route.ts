import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { attributeSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { logActivity } from '@/lib/activity-logger';

const FALLBACK_ATTRIBUTES = [
  {
    id: 'attr-1',
    name: 'Flacon Volume',
    code: 'flacon_volume',
    type: 'SELECT',
    isFilterable: true,
    isVariant: true,
    isRequired: false,
    sortOrder: 1,
    values: [
      { id: 'val-1', value: '50ml Eau de Parfum', label: '50ml', sortOrder: 1 },
      { id: 'val-2', value: '100ml Grand Flacon', label: '100ml', sortOrder: 2 },
    ],
  },
  {
    id: 'attr-2',
    name: 'Gold Purity',
    code: 'gold_purity',
    type: 'SELECT',
    isFilterable: true,
    isVariant: false,
    isRequired: false,
    sortOrder: 2,
    values: [
      { id: 'val-3', value: '24K Swiss Colloidal', label: '24K', sortOrder: 1 },
      { id: 'val-4', value: '18K Solid Yellow Gold', label: '18K', sortOrder: 2 },
    ],
  },
];

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

    if (attributes && attributes.length > 0) {
      return successResponse({ attributes });
    }
    return successResponse({ attributes: FALLBACK_ATTRIBUTES });
  } catch (error: any) {
    console.error('Fetch attributes fallback:', error);
    return successResponse({ attributes: FALLBACK_ATTRIBUTES });
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
    }).catch(() => null);

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

    try {
      await logActivity({
        adminUserId: auth.admin?.id,
        action: 'CREATE',
        entity: 'Attribute',
        entityId: attribute.id,
        metadata: { name: attribute.name, code: attribute.code, type: attribute.type },
      });
    } catch {
      // Non-critical
    }

    return successResponse({ attribute }, 201);
  } catch (error: any) {
    console.error('Create attribute error:', error);
    return errorResponse('Failed to create attribute', 500);
  }
}
