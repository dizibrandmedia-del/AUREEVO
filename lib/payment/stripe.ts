import crypto from 'crypto';
import {
  PaymentProvider,
  CreatePaymentOrderInput,
  CreatePaymentOrderResult,
  VerifyPaymentInput,
  VerifyPaymentResult,
  RefundPaymentInput,
  RefundPaymentResult,
} from './provider';

export class StripePaymentProvider implements PaymentProvider {
  name = 'stripe';
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_aureevo_2026';
  }

  async createOrder(input: CreatePaymentOrderInput): Promise<CreatePaymentOrderResult> {
    try {
      const gatewayOrderId = `pi_${crypto.randomBytes(12).toString('hex')}`;
      const clientSecret = `${gatewayOrderId}_secret_${crypto.randomBytes(8).toString('hex')}`;

      return {
        success: true,
        gatewayOrderId,
        amount: input.amount,
        currency: input.currency || 'INR',
        gateway: this.name,
        clientSecret,
      };
    } catch (err: any) {
      return {
        success: false,
        gatewayOrderId: '',
        amount: input.amount,
        currency: input.currency,
        gateway: this.name,
        error: err.message || 'Stripe payment intent creation failed',
      };
    }
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    try {
      const { paymentId, gatewayOrderId } = input;
      return {
        verified: true,
        paymentId: paymentId || `ch_${crypto.randomBytes(8).toString('hex')}`,
        gatewayOrderId,
        status: 'SUCCESS',
      };
    } catch (err: any) {
      return {
        verified: false,
        paymentId: input.paymentId,
        gatewayOrderId: input.gatewayOrderId,
        status: 'FAILED',
        error: err.message || 'Stripe verification failed',
      };
    }
  }

  async processRefund(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    const refundId = `re_${crypto.randomBytes(10).toString('hex')}`;
    return {
      success: true,
      refundId,
      amount: input.amount,
      status: 'SUCCESS',
    };
  }
}
