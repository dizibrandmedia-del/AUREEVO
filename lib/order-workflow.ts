import { prisma } from './prisma';

export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  NEW: ['CONFIRMED', 'CANCELLED', 'FAILED'],
  CONFIRMED: ['PROCESSING', 'PACKED', 'CANCELLED'],
  PROCESSING: ['PACKED', 'SHIPPED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
  DELIVERED: ['RETURN_REQUESTED', 'CANCELLED'],
  RETURN_REQUESTED: ['RETURN_APPROVED', 'REJECTED', 'REFUNDED', 'CANCELLED'],
  RETURN_APPROVED: ['RETURNED', 'REFUND_INITIATED', 'REFUNDED', 'CANCELLED'],
  RETURNED: ['REFUND_INITIATED', 'REFUNDED'],
  REFUND_INITIATED: ['REFUNDED', 'FAILED'],
  REFUNDED: [],
  CANCELLED: [],
  FAILED: ['NEW'],
};

export interface UpdateOrderStatusOptions {
  orderId: string;
  nextStatus: string;
  comment?: string;
  performedBy?: string;
  cancelReason?: string;
}

export async function transitionOrderStatus(
  options: UpdateOrderStatusOptions
): Promise<{ success: boolean; order?: any; error?: string }> {
  const { orderId, nextStatus, comment, performedBy = 'SYSTEM', cancelReason } = options;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, shipments: true },
  });

  if (!order) {
    return { success: false, error: 'Order not found' };
  }

  const currentStatus = order.status;
  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];

  if (currentStatus !== nextStatus && !allowedTransitions.includes(nextStatus)) {
    return {
      success: false,
      error: `Invalid status transition from "${currentStatus}" to "${nextStatus}". Allowed: ${allowedTransitions.join(
        ', '
      )}`,
    };
  }

  // Execute State Transition inside Database Transaction
  const updatedOrder = await prisma.$transaction(async (tx) => {
    // 1. If transitioning to CANCELLED: restore or unreserve stock
    if (nextStatus === 'CANCELLED' && currentStatus !== 'CANCELLED') {
      for (const item of order.items) {
        const inventory = await tx.inventory.findFirst({
          where: {
            productId: item.productId,
            ...(item.variantId ? { variantId: item.variantId } : {}),
          },
        });

        if (inventory) {
          // If already shipped/packed, restore physical stock
          const isPhysicalDeducted = ['PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(
            currentStatus
          );

          if (isPhysicalDeducted) {
            const previousQty = inventory.currentStock;
            const newQty = previousQty + item.quantity;

            await tx.inventory.update({
              where: { id: inventory.id },
              data: { currentStock: newQty },
            });

            await tx.stockHistory.create({
              data: {
                inventoryId: inventory.id,
                productId: item.productId,
                variantId: item.variantId || null,
                warehouseId: inventory.warehouseId,
                previousQty,
                newQty,
                diffQty: item.quantity,
                action: 'RETURN',
                reason: `Order #${order.orderNumber} Cancelled: Stock Restored`,
              },
            });
          } else {
            // Unreserve
            const newReserved = Math.max(0, inventory.reservedStock - item.quantity);
            await tx.inventory.update({
              where: { id: inventory.id },
              data: { reservedStock: newReserved },
            });
          }
        }
      }
    }

    // 2. If transitioning from NEW/CONFIRMED to PACKED/SHIPPED: commit physical deduction
    if (
      (nextStatus === 'PACKED' || nextStatus === 'SHIPPED') &&
      ['NEW', 'CONFIRMED', 'PROCESSING'].includes(currentStatus)
    ) {
      for (const item of order.items) {
        const inventory = await tx.inventory.findFirst({
          where: {
            productId: item.productId,
            ...(item.variantId ? { variantId: item.variantId } : {}),
          },
        });

        if (inventory) {
          const previousQty = inventory.currentStock;
          const newQty = Math.max(0, previousQty - item.quantity);
          const newReserved = Math.max(0, inventory.reservedStock - item.quantity);

          await tx.inventory.update({
            where: { id: inventory.id },
            data: { currentStock: newQty, reservedStock: newReserved },
          });

          await tx.stockHistory.create({
            data: {
              inventoryId: inventory.id,
              productId: item.productId,
              variantId: item.variantId || null,
              warehouseId: inventory.warehouseId,
              previousQty,
              newQty,
              diffQty: -item.quantity,
              action: 'SALE',
              reason: `Order #${order.orderNumber} Dispatched`,
            },
          });
        }
      }
    }

    // 3. Update Order Record
    const result = await tx.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
        cancelReason: cancelReason || order.cancelReason,
        cancelledAt: nextStatus === 'CANCELLED' ? new Date() : order.cancelledAt,
        deliveredAt: nextStatus === 'DELIVERED' ? new Date() : order.deliveredAt,
        statusHistory: {
          create: {
            fromStatus: currentStatus,
            toStatus: nextStatus,
            comment: comment || `Status updated to ${nextStatus}`,
            performedBy,
          },
        },
      },
      include: {
        items: true,
        payments: true,
        shipments: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    return result;
  });

  return { success: true, order: updatedOrder };
}
