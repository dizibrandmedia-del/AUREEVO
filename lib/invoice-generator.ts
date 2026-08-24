export interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  orderDate: string;
  invoiceDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: any;
  billingAddress: any;
  items: Array<{
    name: string;
    variantName?: string;
    sku: string;
    hsnCode: string;
    quantity: number;
    unitPrice: number;
    unitMrp: number;
    taxRate: number;
    taxAmount: number;
    totalPrice: number;
  }>;
  subtotal: number;
  discountTotal: number;
  couponCode?: string;
  couponDiscount: number;
  taxTotal: number;
  cgst: number;
  sgst: number;
  shippingFee: number;
  codCharges: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
}

export function generateInvoiceData(order: any): InvoiceData {
  const shippingAddr = typeof order.shippingAddress === 'string'
    ? JSON.parse(order.shippingAddress)
    : order.shippingAddress || {};

  const billingAddr = order.billingAddress
    ? typeof order.billingAddress === 'string'
      ? JSON.parse(order.billingAddress)
      : order.billingAddress
    : shippingAddr;

  const payment = order.payments?.[0] || {};
  const cgst = Math.round(order.taxTotal / 2);
  const sgst = order.taxTotal - cgst;

  const items = (order.items || []).map((item: any) => ({
    name: item.productName || item.product?.name,
    variantName: item.variantName || item.variant?.name,
    sku: item.sku || item.product?.sku,
    hsnCode: '33049910', // Luxury Cosmetics / Skincare HSN Code
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    unitMrp: item.unitMrp || item.unitPrice,
    taxRate: item.taxRate || 18.0,
    taxAmount: item.taxAmount || 0,
    totalPrice: item.totalPrice || item.unitPrice * item.quantity,
  }));

  return {
    invoiceNumber: `INV-${order.orderNumber.replace('AUR-', '')}`,
    orderNumber: order.orderNumber,
    orderDate: new Date(order.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    invoiceDate: new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    customerName: order.user
      ? `${order.user.firstName} ${order.user.lastName}`
      : order.guestName || shippingAddr.name || 'Valued Client',
    customerEmail: order.user?.email || order.guestEmail || '',
    customerPhone: order.user?.phone || order.guestPhone || shippingAddr.phone || '',
    shippingAddress: shippingAddr,
    billingAddress: billingAddr,
    items,
    subtotal: order.subtotal,
    discountTotal: order.discountTotal || 0,
    couponCode: order.couponCode,
    couponDiscount: order.couponDiscount || 0,
    taxTotal: order.taxTotal,
    cgst,
    sgst,
    shippingFee: order.shippingFee,
    codCharges: order.codCharges || 0,
    grandTotal: order.grandTotal,
    paymentMethod: payment.paymentMethod || 'PREPAID',
    paymentStatus: payment.status || 'SUCCESS',
    transactionId: payment.transactionId || 'N/A',
  };
}
