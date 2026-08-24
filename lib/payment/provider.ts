export interface CreatePaymentOrderInput {
  orderId: string;
  orderNumber: string;
  amount: number; // in Rupees
  currency: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  notes?: Record<string, string>;
}

export interface CreatePaymentOrderResult {
  success: boolean;
  gatewayOrderId: string;
  amount: number;
  currency: string;
  gateway: string;
  keyId?: string;
  clientSecret?: string;
  error?: string;
}

export interface VerifyPaymentInput {
  orderId: string;
  gatewayOrderId: string;
  paymentId: string;
  signature?: string;
}

export interface VerifyPaymentResult {
  verified: boolean;
  paymentId: string;
  gatewayOrderId: string;
  amount?: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  error?: string;
}

export interface RefundPaymentInput {
  paymentId: string;
  amount: number;
  reason?: string;
}

export interface RefundPaymentResult {
  success: boolean;
  refundId: string;
  amount: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  error?: string;
}

export interface PaymentProvider {
  name: string;
  createOrder(input: CreatePaymentOrderInput): Promise<CreatePaymentOrderResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;
  processRefund(input: RefundPaymentInput): Promise<RefundPaymentResult>;
}
