import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30days';
    const exportFormat = searchParams.get('export');

    const now = new Date();
    let startDate = new Date();

    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'yesterday') {
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === '7days') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      // 30 days default
      startDate.setDate(now.getDate() - 30);
    }

    const whereDate = { createdAt: { gte: startDate } };

    const [orders, allPayments, refunds, returnRequests, customersCount] = await Promise.all([
      prisma.order.findMany({
        where: whereDate,
        include: {
          items: true,
          payments: true,
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.findMany({ where: whereDate }),
      prisma.refund.findMany({ where: whereDate }),
      prisma.returnRequest.findMany({ where: whereDate }),
      prisma.user.count(),
    ]);

    // Financial Metrics
    const validOrders = orders.filter((o) => o.status !== 'CANCELLED' && o.status !== 'FAILED');
    const totalRevenue = validOrders.reduce((acc, o) => acc + o.grandTotal, 0);
    const totalTaxCollected = validOrders.reduce((acc, o) => acc + o.taxTotal, 0);
    const totalShippingCollected = validOrders.reduce((acc, o) => acc + o.shippingFee, 0);
    const totalDiscountsGiven = validOrders.reduce(
      (acc, o) => acc + o.discountTotal + o.couponDiscount,
      0
    );

    const totalRefundsAmount = refunds.reduce((acc, r) => acc + r.amount, 0);

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    orders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    // Payment Methods breakdown
    const paymentMethodCounts: Record<string, { count: number; amount: number }> = {};
    allPayments.forEach((p) => {
      const pm = p.paymentMethod || 'OTHER';
      if (!paymentMethodCounts[pm]) {
        paymentMethodCounts[pm] = { count: 0, amount: 0 };
      }
      paymentMethodCounts[pm].count += 1;
      paymentMethodCounts[pm].amount += p.amount;
    });

    // Top Products
    const productMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    validOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!productMap[item.productId]) {
          productMap[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
          };
        }
        productMap[item.productId].quantity += item.quantity;
        productMap[item.productId].revenue += item.totalPrice;
      });
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // CSV Export Flow
    if (exportFormat === 'csv') {
      const headers = ['Order Number', 'Date', 'Customer', 'Status', 'Items Qty', 'Subtotal', 'Tax', 'Shipping', 'Grand Total', 'Payment'];
      const rows = orders.map((o) => [
        o.orderNumber,
        new Date(o.createdAt).toISOString().split('T')[0],
        o.user ? `${o.user.firstName} ${o.user.lastName}` : o.guestName || 'Guest',
        o.status,
        o.items.reduce((acc, i) => acc + i.quantity, 0),
        o.subtotal,
        o.taxTotal,
        o.shippingFee,
        o.grandTotal,
        o.payments?.[0]?.paymentMethod || 'PREPAID',
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="aureevo_sales_report_${period}.csv"`,
        },
      });
    }

    return successResponse({
      summary: {
        totalRevenue,
        orderCount: orders.length,
        validOrderCount: validOrders.length,
        averageOrderValue: validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0,
        totalTaxCollected,
        totalShippingCollected,
        totalDiscountsGiven,
        totalRefundsAmount,
        customersCount,
        returnCount: returnRequests.length,
      },
      statusCounts,
      paymentMethodCounts,
      topProducts,
      recentOrders: orders.slice(0, 10),
    });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to generate reports', 500);
  }
}
