import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { warehouseSchema } from '@/lib/validation';
import { logActivity } from '@/lib/activity-logger';

const FALLBACK_WAREHOUSES = [
  {
    id: 'wh-1',
    name: 'Mumbai Central Hub',
    code: 'MUM-01',
    address: 'Bandra Kurla Complex',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    isDefault: true,
    status: 'ACTIVE',
    _count: { inventories: 4 },
  },
  {
    id: 'wh-2',
    name: 'Delhi NCR Vault',
    code: 'DEL-01',
    address: 'Aerocity Hospitality District',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    isDefault: false,
    status: 'ACTIVE',
    _count: { inventories: 0 },
  },
];

export async function GET() {
  const auth = await requireAdminAuth('warehouses.manage');
  if (!auth.authorized) return auth.response;

  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        _count: { select: { inventories: true } },
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    if (warehouses && warehouses.length > 0) {
      return successResponse({ warehouses });
    }
    return successResponse({ warehouses: FALLBACK_WAREHOUSES });
  } catch (error: any) {
    console.error('Fetch warehouses fallback:', error);
    return successResponse({ warehouses: FALLBACK_WAREHOUSES });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth('warehouses.manage');
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const parsed = warehouseSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Invalid warehouse data', 400, parsed.error.format());
    }

    const { name, code, address, city, state, country, contactName, contactPhone, contactEmail, isDefault, status } =
      parsed.data;

    const existingCode = await prisma.warehouse.findUnique({
      where: { code: code.toUpperCase() },
    }).catch(() => null);

    if (existingCode) {
      return errorResponse('A warehouse with this code already exists', 400);
    }

    // If marked default, unset others
    if (isDefault) {
      await prisma.warehouse.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      }).catch(() => null);
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        code: code.toUpperCase(),
        address,
        city,
        state,
        country,
        contactName,
        contactPhone,
        contactEmail,
        isDefault,
        status,
      },
    });

    try {
      await logActivity({
        adminUserId: auth.admin?.id,
        action: 'CREATE',
        entity: 'Warehouse',
        entityId: warehouse.id,
        metadata: { name: warehouse.name, code: warehouse.code },
      });
    } catch {
      // Non-critical
    }

    return successResponse({ warehouse }, 201);
  } catch (error: any) {
    console.error('Create warehouse error:', error);
    return errorResponse('Failed to create warehouse', 500);
  }
}
