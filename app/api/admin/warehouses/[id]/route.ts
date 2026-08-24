import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { warehouseSchema } from '@/lib/validation';
import { logActivity } from '@/lib/activity-logger';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth('warehouses.manage');
  if (!auth.authorized) return auth.response;

  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: params.id },
      include: {
        inventories: {
          include: {
            product: { select: { name: true, sku: true } },
            variant: { select: { name: true, sku: true } },
          },
        },
      },
    });

    if (!warehouse) return errorResponse('Warehouse not found', 404);
    return successResponse({ warehouse });
  } catch (error) {
    return errorResponse('Failed to fetch warehouse', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

    const existingCode = await prisma.warehouse.findFirst({
      where: { code: code.toUpperCase(), NOT: { id: params.id } },
    });

    if (existingCode) {
      return errorResponse('Another warehouse with this code already exists', 400);
    }

    if (isDefault) {
      await prisma.warehouse.updateMany({
        where: { isDefault: true, NOT: { id: params.id } },
        data: { isDefault: false },
      });
    }

    const warehouse = await prisma.warehouse.update({
      where: { id: params.id },
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

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'UPDATE',
      entity: 'Warehouse',
      entityId: warehouse.id,
      metadata: { name: warehouse.name, code: warehouse.code },
    });

    return successResponse({ warehouse });
  } catch (error: any) {
    console.error('Update warehouse error:', error);
    return errorResponse('Failed to update warehouse', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth('warehouses.manage');
  if (!auth.authorized) return auth.response;

  try {
    const existing = await prisma.warehouse.findUnique({
      where: { id: params.id },
      include: { _count: { select: { inventories: true } } },
    });

    if (!existing) return errorResponse('Warehouse not found', 404);

    if (existing.isDefault) {
      return errorResponse('Cannot delete the default warehouse', 400);
    }

    if (existing._count.inventories > 0) {
      return errorResponse(
        `Cannot delete warehouse: Currently holds ${existing._count.inventories} inventory record(s). Transfer stock first.`,
        400
      );
    }

    await prisma.warehouse.delete({ where: { id: params.id } });

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'DELETE',
      entity: 'Warehouse',
      entityId: params.id,
      metadata: { name: existing.name, code: existing.code },
    });

    return successResponse({ message: 'Warehouse deleted successfully' });
  } catch (error: any) {
    console.error('Delete warehouse error:', error);
    return errorResponse('Failed to delete warehouse', 500);
  }
}
