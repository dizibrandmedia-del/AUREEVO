import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateOrderTotals } from '@/lib/order-engine';
import { getPaymentProvider } from '@/lib/payment';
import { successResponse, errorResponse } from '@/lib/api-response';
import { verifyCustomerToken, getCustomerCookieName } from '@/lib/jwt';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      couponCode,
      deliveryMethod = 'STANDARD',
      paymentMethod = 'UPI',
      gateway = 'razorpay',
      shippingAddress,
      billingAddress,
      guestEmail,
      guestPhone,
      guestName,
      notes,
    } = body;

    // 1. Identify User (Logged-in or Guest)
    let userId: string | null = null;
    let customerName = guestName || 'Patron';
    let customerEmail = guestEmail || '';
    let customerPhone = guestPhone || '';

    const token = req.cookies.get(getCustomerCookieName())?.value;
    if (token) {
      const payload = await verifyCustomerToken(token);
      if (payload) {
        userId = payload.userId;
        const dbUser = await prisma.user.findUnique({ where: { id: userId } });
        if (dbUser) {
          customerName = `${dbUser.firstName} ${dbUser.lastName}`;
          customerEmail = dbUser.email;
          customerPhone = dbUser.phone || guestPhone || '';
        }
      }
    }

    if (!shippingAddress) {
      return errorResponse('Shipping address is required to proceed with checkout', 400);
    }

    // 2. Validate Indian Pincode
    const pin = shippingAddress.pincode ? String(shippingAddress.pincode).trim() : '';
    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      return errorResponse('Please provide a valid 6-digit Indian postal pincode', 400);
    }

    // 3. Centralized Server-Side Pricing & Stock Calculation
    const calculation = await calculateOrderTotals({
      items: items || [],
      couponCode,
      deliveryMethod,
      paymentMethod,
      userId,
      shippingPincode: pin,
    });

    if (!calculation.isValid) {
      return errorResponse(calculation.validationErrors.join(', '), 400);
    }

    if (calculation.items.length === 0) {
      return errorResponse('Cannot create order with an empty shopping bag', 400);
    }

    // 4. Generate Unique Order Number
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `AUR-${year}-${randomSuffix}`;

    // 5. Database Transaction: Create Order, OrderItems, Reserve Stock, Record Status
    const createdOrder = await prisma.$transaction(async (tx) => {
      // Check & Reserve Inventory
      for (const item of calculation.items) {
        const inventory = await tx.inventory.findFirst({
          where: {
            productId: item.productId,
            variantId: item.variantId || null,
          },
        });

        if (inventory) {
          await tx.inventory.update({
            where: { id: inventory.id },
            data: {
              reservedStock: inventory.reservedStock + item.quantity,
            },
          });
        }
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          guestEmail: userId ? null : customerEmail,
          guestPhone: userId ? null : customerPhone,
          guestName: userId ? null : customerName,
          status: paymentMethod === 'COD' ? 'CONFIRMED' : 'NEW',
          subtotal: calculation.subtotal,
          discountTotal: calculation.retailDiscount,
          couponCode: calculation.couponCode,
          couponDiscount: calculation.couponDiscount,
          taxTotal: calculation.taxTotal,
          shippingFee: calculation.shippingFee,
          codCharges: calculation.codCharges,
          grandTotal: calculation.grandTotal,
          currency: calculation.currency,
          deliveryMethod: calculation.deliveryMethod,
          shippingAddress: JSON.stringify(shippingAddress),
          billingAddress: billingAddress ? JSON.stringify(billingAddress) : JSON.stringify(shippingAddress),
          notes: notes || null,
          items: {
            create: calculation.items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId || null,
              productName: i.productName,
              variantName: i.variantName || null,
              sku: i.sku,
              image: i.image,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              unitMrp: i.unitMrp,
              taxRate: i.taxRate,
              taxAmount: i.taxAmount,
              totalPrice: i.totalPrice,
            })),
          },
          statusHistory: {
            create: {
              fromStatus: null,
              toStatus: paymentMethod === 'COD' ? 'CONFIRMED' : 'NEW',
              comment:
                paymentMethod === 'COD'
                  ? 'Order placed with Cash on Delivery (White-Glove Dispatch)'
                  : 'Order initialized awaiting luxury payment verification',
              performedBy: userId || 'GUEST_CLIENT',
            },
          },
        },
        include: { items: true },
      });

      // If Coupon used, record usage count & audit record
      if (calculation.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: calculation.couponCode },
        });
        if (coupon) {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usageCount: coupon.usageCount + 1 },
          });

          await tx.couponUsage.create({
            data: {
              couponId: coupon.id,
              userId,
              orderId: newOrder.id,
              discountApplied: calculation.couponDiscount,
            },
          });
        }
      }

      // Clear Shopping Cart
      if (userId) {
        const userCart = await tx.cart.findUnique({ where: { userId } });
        if (userCart) {
          await tx.cartItem.deleteMany({
            where: { cartId: userCart.id, isSavedForLater: false },
          });
        }
      }

      return newOrder;
    });

    // 6. Initialize Payment Gateway Request (Razorpay / Stripe / COD)
    if (paymentMethod === 'COD') {
      await prisma.payment.create({
        data: {
          orderId: createdOrder.id,
          paymentMethod: 'COD',
          gateway: 'cod',
          amount: createdOrder.grandTotal,
          currency: 'INR',
          status: 'PENDING',
        },
      });

      return successResponse({
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        status: 'CONFIRMED',
        paymentMethod: 'COD',
        amount: createdOrder.grandTotal,
        currency: createdOrder.currency,
      });
    }

    // Online Gateway Flow
    const paymentProvider = getPaymentProvider(gateway);
    const gatewayOrder = await paymentProvider.createOrder({
      orderId: createdOrder.id,
      orderNumber: createdOrder.orderNumber,
      amount: createdOrder.grandTotal,
      currency: createdOrder.currency,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
    });

    // Create Payment Record in Database
    await prisma.payment.create({
      data: {
        orderId: createdOrder.id,
        paymentMethod,
        gateway: paymentProvider.name,
        gatewayOrderId: gatewayOrder.gatewayOrderId,
        amount: createdOrder.grandTotal,
        currency: createdOrder.currency,
        status: 'PENDING',
      },
    });

    return successResponse({
      orderId: createdOrder.id,
      orderNumber: createdOrder.orderNumber,
      status: 'NEW',
      paymentMethod,
      gateway: paymentProvider.name,
      gatewayOrderId: gatewayOrder.gatewayOrderId,
      keyId: gatewayOrder.keyId || process.env.RAZORPAY_KEY_ID || 'rzp_test_aureevo_2026',
      clientSecret: gatewayOrder.clientSecret,
      amount: createdOrder.grandTotal,
      currency: createdOrder.currency,
    });
  } catch (err: any) {
    return errorResponse(err.message || 'Order creation failed', 500);
  }
}
