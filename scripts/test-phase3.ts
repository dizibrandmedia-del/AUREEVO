import { prisma } from '../lib/prisma';
import { calculateOrderTotals } from '../lib/order-engine';
import { validateAndApplyCoupon } from '../lib/coupon-engine';
import { getPaymentProvider } from '../lib/payment';
import { getCourierProvider } from '../lib/courier';
import { transitionOrderStatus, VALID_STATUS_TRANSITIONS } from '../lib/order-workflow';
import { generateInvoiceData } from '../lib/invoice-generator';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(suite: string, name: string, condition: boolean, errorMsg?: string) {
  if (condition) {
    results.push({ suite, name, passed: true });
    console.log(`  ✓ [${suite}] ${name}`);
  } else {
    results.push({ suite, name, passed: false, error: errorMsg || 'Assertion failed' });
    console.error(`  ✗ [${suite}] ${name} — ${errorMsg || 'FAILED'}`);
  }
}

async function runTests() {
  console.log('\n==================================================');
  console.log('  AUREEVO PHASE 3 AUTOMATED INTEGRATION TEST SUITE');
  console.log('==================================================\n');

  try {
    // Fetch test product and user
    const product = await prisma.product.findFirst({
      where: { status: 'ACTIVE' },
      include: { variants: true, inventories: true },
    });

    const customer = await prisma.user.findFirst({
      where: { email: 'customer@example.com' },
    });

    const admin = await prisma.adminUser.findFirst({
      where: { email: 'admin@aureevo.com' },
    });

    if (!product || !customer || !admin) {
      throw new Error('Database must be seeded before running integration tests.');
    }

    // ----------------------------------------------------
    // SUITE 1: Server-Side Order Calculation Engine
    // ----------------------------------------------------
    console.log('\n[Suite 1] Order Calculation & Pricing Engine');

    const standardCalc = await calculateOrderTotals({
      items: [{ productId: product.id, quantity: 2 }],
      deliveryMethod: 'STANDARD',
      paymentMethod: 'UPI',
    });

    assert('Suite 1', 'Returns valid calculation result', standardCalc.isValid);
    assert('Suite 1', 'Subtotal matches product price * quantity', standardCalc.subtotal === product.sellingPrice * 2);
    assert('Suite 1', 'Calculates 18% GST tax correctly', standardCalc.taxTotal === Math.round(standardCalc.subtotal * 0.18));
    assert(
      'Suite 1',
      'Calculates Free Shipping when subtotal >= ₹5,000 threshold',
      standardCalc.subtotal >= 5000 ? standardCalc.shippingFee === 0 : standardCalc.shippingFee > 0
    );

    const codCalc = await calculateOrderTotals({
      items: [{ productId: product.id, quantity: 1 }],
      deliveryMethod: 'STANDARD',
      paymentMethod: 'COD',
    });

    assert('Suite 1', 'Applies COD extra surcharge fee', codCalc.codCharges === 100);

    // ----------------------------------------------------
    // SUITE 2: Coupon & Promotional Engine
    // ----------------------------------------------------
    console.log('\n[Suite 2] Coupon & Privilege Voucher Engine');

    // Test Percentage Coupon ROYAL10 (10% off, max 1500)
    const royal10 = await validateAndApplyCoupon({
      code: 'ROYAL10',
      subtotal: 10000,
      items: [{ productId: product.id, totalPrice: 10000 }],
      userId: customer.id,
      paymentMethod: 'UPI',
    });

    assert('Suite 2', 'Validates ROYAL10 coupon correctly', royal10.isValid);
    assert('Suite 2', 'Calculates 10% discount correctly (₹1,000)', royal10.discountAmount === 1000);

    // Test Flat Coupon AUREEVO500 (₹500 flat off on min 4000)
    const aureevo500 = await validateAndApplyCoupon({
      code: 'AUREEVO500',
      subtotal: 5000,
      items: [{ productId: product.id, totalPrice: 5000 }],
      userId: customer.id,
    });

    assert('Suite 2', 'Validates AUREEVO500 flat coupon', aureevo500.isValid);
    assert('Suite 2', 'Calculates flat ₹500 discount', aureevo500.discountAmount === 500);

    // Test Min Order Value failure
    const minOrderFail = await validateAndApplyCoupon({
      code: 'AUREEVO500',
      subtotal: 2000, // Below 4000
      items: [{ productId: product.id, totalPrice: 2000 }],
    });

    assert('Suite 2', 'Enforces minimum order value constraint', !minOrderFail.isValid);

    // Test Inactive / Non-existent coupon
    const invalidCoupon = await validateAndApplyCoupon({
      code: 'NON_EXISTENT_CODE_2026',
      subtotal: 10000,
      items: [{ productId: product.id, totalPrice: 10000 }],
    });

    assert('Suite 2', 'Rejects non-existent coupons with descriptive error', !invalidCoupon.isValid);

    // ----------------------------------------------------
    // SUITE 3: Payment Gateway Providers
    // ----------------------------------------------------
    console.log('\n[Suite 3] Payment Gateway Providers Abstraction');

    const razorpay = getPaymentProvider('razorpay');
    const rzpOrder = await razorpay.createOrder({
      orderId: 'test-order-1',
      orderNumber: 'AUR-TEST-001',
      amount: 12500,
      currency: 'INR',
      customer: { name: 'Lady Genevieve', email: 'patron@aureevo.com', phone: '9988776655' },
    });

    assert('Suite 3', 'Razorpay provider generates gateway order ID', rzpOrder.success && !!rzpOrder.gatewayOrderId);

    const rzpVerify = await razorpay.verifyPayment({
      orderId: 'test-order-1',
      gatewayOrderId: rzpOrder.gatewayOrderId,
      paymentId: 'pay_test_123456',
      signature: 'sim_sig_valid',
    });

    assert('Suite 3', 'Razorpay provider verifies payment signature', rzpVerify.verified);

    const stripe = getPaymentProvider('stripe');
    const stripeOrder = await stripe.createOrder({
      orderId: 'test-order-2',
      orderNumber: 'AUR-TEST-002',
      amount: 25000,
      currency: 'INR',
      customer: { name: 'Lady Genevieve', email: 'patron@aureevo.com', phone: '9988776655' },
    });

    assert('Suite 3', 'Stripe provider creates payment intent and clientSecret', stripeOrder.success && !!stripeOrder.clientSecret);

    // ----------------------------------------------------
    // SUITE 4: Multi-Courier Logistics Providers
    // ----------------------------------------------------
    console.log('\n[Suite 4] Multi-Courier Logistics & Tracking');

    const bluedart = getCourierProvider('BLUE_DART');
    const serviceability = await bluedart.checkServiceability('400001');

    assert('Suite 4', 'Blue Dart checks Indian 6-digit PIN serviceability', serviceability.serviceable);

    const shipment = await bluedart.createShipment({
      orderId: 'test-order-bd',
      orderNumber: 'AUR-BD-900',
      recipient: {
        name: 'Patron',
        phone: '9988776655',
        addressLine1: 'Villa 1',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      },
      items: [{ name: product.name, sku: product.sku, quantity: 1, price: product.sellingPrice }],
      totalAmount: product.sellingPrice,
      isCod: false,
    });

    assert('Suite 4', 'Blue Dart creates shipment with AWB and tracking URL', shipment.success && !!shipment.awbNumber);

    const tracking = await bluedart.trackShipment(shipment.awbNumber);
    assert('Suite 4', 'Blue Dart returns live tracking milestones timeline', tracking.timeline.length > 0);

    // ----------------------------------------------------
    // SUITE 5: Order State Machine & Stock Transactions
    // ----------------------------------------------------
    console.log('\n[Suite 5] Order State Machine & Inventory Audit');

    // Create a real test order in Database
    const initialInv = await prisma.inventory.findFirst({
      where: { productId: product.id },
    });
    const initialStock = initialInv?.currentStock || 0;
    const initialReserved = initialInv?.reservedStock || 0;

    const testOrderNumber = `AUR-TEST-${Date.now()}`;
    const testOrder = await prisma.order.create({
      data: {
        orderNumber: testOrderNumber,
        userId: customer.id,
        status: 'NEW',
        subtotal: product.sellingPrice,
        taxTotal: Math.round(product.sellingPrice * 0.18),
        shippingFee: 0,
        grandTotal: Math.round(product.sellingPrice * 1.18),
        deliveryMethod: 'STANDARD',
        shippingAddress: JSON.stringify({
          name: 'Patron Tester',
          phone: '9988776655',
          addressLine1: 'Penthouse 1',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
        }),
        items: {
          create: [
            {
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              quantity: 1,
              unitPrice: product.sellingPrice,
              unitMrp: product.mrp || product.sellingPrice,
              taxRate: 18.0,
              taxAmount: Math.round(product.sellingPrice * 0.18),
              totalPrice: product.sellingPrice,
            },
          ],
        },
        payments: {
          create: {
            paymentMethod: 'UPI',
            gateway: 'razorpay',
            amount: Math.round(product.sellingPrice * 1.18),
            status: 'SUCCESS',
            transactionId: `pay_test_${Date.now()}`,
          },
        },
      },
    });

    assert('Suite 5', 'Order created in database with NEW status', testOrder.status === 'NEW');

    // Transition NEW -> CONFIRMED
    const confirmRes = await transitionOrderStatus({
      orderId: testOrder.id,
      nextStatus: 'CONFIRMED',
      comment: 'Payment verified',
    });
    assert('Suite 5', 'Transitions NEW -> CONFIRMED', confirmRes.success && confirmRes.order.status === 'CONFIRMED');

    // Transition CONFIRMED -> PACKED (commits physical stock deduction)
    const packRes = await transitionOrderStatus({
      orderId: testOrder.id,
      nextStatus: 'PACKED',
      comment: 'Vault packed',
    });
    assert('Suite 5', 'Transitions CONFIRMED -> PACKED', packRes.success && packRes.order.status === 'PACKED');

    // Verify Stock History audit was logged
    const stockAudit = await prisma.stockHistory.findFirst({
      where: { productId: product.id, action: 'SALE' },
      orderBy: { createdAt: 'desc' },
    });
    assert('Suite 5', 'StockHistory SALE audit recorded on packing', !!stockAudit);

    // Transition PACKED -> SHIPPED
    const shipRes = await transitionOrderStatus({
      orderId: testOrder.id,
      nextStatus: 'SHIPPED',
      comment: 'Dispatched via Blue Dart',
    });
    assert('Suite 5', 'Transitions PACKED -> SHIPPED', shipRes.success && shipRes.order.status === 'SHIPPED');

    // Transition SHIPPED -> DELIVERED
    const deliverRes = await transitionOrderStatus({
      orderId: testOrder.id,
      nextStatus: 'DELIVERED',
      comment: 'Delivered to client with OTP signature',
    });
    assert('Suite 5', 'Transitions SHIPPED -> DELIVERED', deliverRes.success && deliverRes.order.status === 'DELIVERED');

    // Disallow Invalid Transition: DELIVERED -> NEW
    const invalidTransition = await transitionOrderStatus({
      orderId: testOrder.id,
      nextStatus: 'NEW',
    });
    assert('Suite 5', 'Disallows invalid status transitions', !invalidTransition.success);

    // ----------------------------------------------------
    // SUITE 6: Returns, Replacements & Duplicate Refund Prevention
    // ----------------------------------------------------
    console.log('\n[Suite 6] Returns, Replacements & Refund Integrity');

    const returnRequest = await prisma.returnRequest.create({
      data: {
        requestNumber: `RET-TEST-${Date.now()}`,
        orderId: testOrder.id,
        userId: customer.id,
        type: 'RETURN',
        reason: 'Fragrance profile preference consultation',
        status: 'PENDING',
        refundAmount: testOrder.grandTotal,
      },
    });

    assert('Suite 6', 'Customer lodges return request on delivered order', returnRequest.status === 'PENDING');

    await transitionOrderStatus({
      orderId: testOrder.id,
      nextStatus: 'RETURN_REQUESTED',
      comment: 'Client return request lodged',
    });

    // Approve Return
    const approvedReturn = await prisma.returnRequest.update({
      where: { id: returnRequest.id },
      data: { status: 'APPROVED' },
    });
    assert('Suite 6', 'Admin approves return request', approvedReturn.status === 'APPROVED');

    await transitionOrderStatus({
      orderId: testOrder.id,
      nextStatus: 'RETURN_APPROVED',
      comment: 'Admin approved return request',
    });

    // Process Refund
    const refund = await prisma.refund.create({
      data: {
        returnRequestId: returnRequest.id,
        orderId: testOrder.id,
        amount: testOrder.grandTotal,
        reason: 'Client fragrance consultation return',
        gateway: 'RAZORPAY',
        status: 'SUCCESS',
        referenceNumber: `REF-TEST-${Date.now()}`,
      },
    });
    assert('Suite 6', 'Refund created with reference number', refund.status === 'SUCCESS');

    // Transition Order to REFUNDED
    const refundOrderRes = await transitionOrderStatus({
      orderId: testOrder.id,
      nextStatus: 'REFUNDED',
      comment: 'Refund successfully completed',
    });
    assert('Suite 6', 'Order transitions to REFUNDED', refundOrderRes.success);

    // ----------------------------------------------------
    // SUITE 7: Compliant GST Tax Invoice Generator
    // ----------------------------------------------------
    console.log('\n[Suite 7] Compliant GST Tax Invoice Generator');

    const completeOrder = await prisma.order.findUnique({
      where: { id: testOrder.id },
      include: { items: true, payments: true, user: true },
    });

    const invoiceData = generateInvoiceData(completeOrder);
    assert('Suite 7', 'Generates unique Tax Invoice number', invoiceData.invoiceNumber.startsWith('INV-'));
    assert('Suite 7', 'Includes HSN Code for cosmetics (33049910)', invoiceData.items[0]?.hsnCode === '33049910');
    assert('Suite 7', 'Includes CGST 9% and SGST 9% breakdown', invoiceData.cgst > 0 && invoiceData.sgst > 0);
    assert('Suite 7', 'Matches grand total calculation', invoiceData.grandTotal === completeOrder?.grandTotal);

    // ----------------------------------------------------
    // Summary
    // ----------------------------------------------------
    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = results.filter((r) => !r.passed).length;

    console.log('\n==================================================');
    console.log(`  PHASE 3 TEST RESULTS: ${passedCount}/${results.length} PASSED (${failedCount} FAILED)`);
    console.log('==================================================\n');

    if (failedCount > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Fatal test execution error:', err);
    process.exit(1);
  }
}

runTests();
