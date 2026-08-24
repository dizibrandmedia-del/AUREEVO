import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { stockAdjustmentSchema } from '@/lib/validation';
import { logActivity } from '@/lib/activity-logger';

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth('inventory.adjust');
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const parsed = stockAdjustmentSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Invalid adjustment data', 400, parsed.error.format());
    }

    const { productId, variantId, warehouseId, newQty, action, reason } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      // Find or create inventory record
      let inventory = await tx.inventory.findFirst({
        where: {
          productId,
          variantId: variantId || null,
          warehouseId,
        },
      });

      const previousQty = inventory ? inventory.currentStock : 0;
      const diffQty = newQty - previousQty;

      if (!inventory) {
        inventory = await tx.inventory.create({
          data: {
            productId,
            variantId: variantId || null,
            warehouseId,
            currentStock: newQty,
            reservedStock: 0,
            lowStockThreshold: 5,
          },
        });
      } else {
        inventory = await tx.inventory.update({
          where: { id: inventory.id },
          data: { currentStock: newQty },
        });
      }

      // If variant, also update variant.stock cached field
      if (variantId) {
        await tx.productVariant.update({
          where: { id: variantId },
          data: { stock: newQty },
        });
      }

      // Record in StockHistory
      const history = await tx.stockHistory.create({
        data: {
          inventoryId: inventory.id,
          productId,
          variantId: variantId || null,
          warehouseId,
          previousQty,
          newQty,
          diffQty,
          action,
          reason,
          adminUserId: auth.admin?.id,
        },
      });

      return { inventory, history };
    });

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'STOCK_ADJUSTMENT',
      entity: 'Inventory',
      entityId: result.inventory.id,
      metadata: {
        productId,
        variantId,
        previousQty: result.history.previousQty,
        newQty: result.history.newQty,
        delta: result.history.diffQty,
        action,
        reason,
      },
    });

    return successResponse({
      inventory: result.inventory,
      history: result.history,
    });
  } catch (error: any) {
    console.error('Stock adjustment error:', error);
    return errorResponse(error.message || 'Failed to adjust stock', 500);
  }
}
