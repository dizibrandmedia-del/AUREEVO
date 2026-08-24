import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.authorized) return auth.response;

  try {
    const [
      totalProducts,
      activeProducts,
      draftProducts,
      totalCategories,
      totalBrands,
      totalCustomers,
      inventories,
      recentActivity,
      recentProducts,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.product.count({ where: { status: 'DRAFT' } }),
      prisma.category.count(),
      prisma.brand.count(),
      prisma.user.count(),
      prisma.inventory.findMany({
        include: {
          product: {
            select: { id: true, name: true, sku: true, images: true, status: true },
          },
          variant: {
            select: { id: true, name: true, sku: true },
          },
          warehouse: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          adminUser: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      }),
      prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true } },
          brand: { select: { name: true } },
        },
      }),
    ]);

    let totalStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const lowStockItems: any[] = [];

    for (const inv of inventories) {
      totalStock += inv.currentStock;
      const available = inv.currentStock - inv.reservedStock;
      if (inv.currentStock <= 0 || available <= 0) {
        outOfStockCount++;
        lowStockItems.push({
          id: inv.id,
          productId: inv.productId,
          productName: inv.product.name,
          sku: inv.variant ? inv.variant.sku : inv.product.sku,
          variantName: inv.variant ? inv.variant.name : null,
          warehouseName: inv.warehouse.name,
          currentStock: inv.currentStock,
          reservedStock: inv.reservedStock,
          availableStock: available,
          lowStockThreshold: inv.lowStockThreshold,
          status: 'OUT_OF_STOCK',
        });
      } else if (inv.currentStock <= inv.lowStockThreshold) {
        lowStockCount++;
        lowStockItems.push({
          id: inv.id,
          productId: inv.productId,
          productName: inv.product.name,
          sku: inv.variant ? inv.variant.sku : inv.product.sku,
          variantName: inv.variant ? inv.variant.name : null,
          warehouseName: inv.warehouse.name,
          currentStock: inv.currentStock,
          reservedStock: inv.reservedStock,
          availableStock: available,
          lowStockThreshold: inv.lowStockThreshold,
          status: 'LOW_STOCK',
        });
      }
    }

    return successResponse({
      stats: {
        totalProducts,
        activeProducts,
        draftProducts,
        totalCategories,
        totalBrands,
        totalCustomers,
        totalStock,
        lowStockCount,
        outOfStockCount,
      },
      lowStockItems: lowStockItems.slice(0, 10),
      recentActivity,
      recentProducts,
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return errorResponse('Failed to fetch dashboard metrics', 500);
  }
}
