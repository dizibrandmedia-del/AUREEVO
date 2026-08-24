import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth('inventory.view');
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const warehouseId = searchParams.get('warehouseId');
    const filter = searchParams.get('filter'); // 'all', 'low_stock', 'out_of_stock'

    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;

    if (search) {
      where.OR = [
        { product: { name: { contains: search } } },
        { product: { sku: { contains: search } } },
        { variant: { name: { contains: search } } },
        { variant: { sku: { contains: search } } },
      ];
    }

    const inventoryRecords = await prisma.inventory.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            images: true,
            status: true,
            productType: true,
            category: { select: { name: true } },
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            stock: true,
            status: true,
          },
        },
        warehouse: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formatted = inventoryRecords.map((inv) => {
      const available = inv.currentStock - inv.reservedStock;
      let stockStatus = 'IN_STOCK';
      if (inv.currentStock <= 0 || available <= 0) {
        stockStatus = 'OUT_OF_STOCK';
      } else if (inv.currentStock <= inv.lowStockThreshold) {
        stockStatus = 'LOW_STOCK';
      }

      return {
        id: inv.id,
        productId: inv.productId,
        variantId: inv.variantId,
        productName: inv.product.name,
        productType: inv.product.productType,
        categoryName: inv.product.category?.name || 'Unassigned',
        sku: inv.variant ? inv.variant.sku : inv.product.sku,
        variantName: inv.variant ? inv.variant.name : null,
        warehouseId: inv.warehouseId,
        warehouseName: inv.warehouse.name,
        warehouseCode: inv.warehouse.code,
        currentStock: inv.currentStock,
        reservedStock: inv.reservedStock,
        availableStock: available,
        lowStockThreshold: inv.lowStockThreshold,
        stockStatus,
        updatedAt: inv.updatedAt,
      };
    });

    let filtered = formatted;
    if (filter === 'low_stock') {
      filtered = formatted.filter((item) => item.stockStatus === 'LOW_STOCK');
    } else if (filter === 'out_of_stock') {
      filtered = formatted.filter((item) => item.stockStatus === 'OUT_OF_STOCK');
    }

    return successResponse({ inventory: filtered });
  } catch (error: any) {
    console.error('Fetch inventory error:', error);
    return errorResponse('Failed to fetch inventory', 500);
  }
}
