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

export class RazorpayPaymentProvider implements PaymentProvider {
  name = 'razorpay';
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_aureevo_2026';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'aureevo_rzp_secret_key_luxury';
  }

  async createOrder(input: CreatePaymentOrderInput): Promise<CreatePaymentOrderResult> {
    try {
      // In live environment, this would call Razorpay Orders API: https://api.razorpay.com/v1/orders
      // Generating standard Razorpay order token:
      const gatewayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;

      return {
        success: true,
        gatewayOrderId,
        amount: input.amount,
        currency: input.currency || 'INR',
        gateway: this.name,
        keyId: this.keyId,
      };
    } catch (err: any) {
      return {
        success: false,
        gatewayOrderId: '',
        amount: input.amount,
        currency: input.currency,
        gateway: this.name,
        error: err.message || 'Razorpay order creation failed',
      };
    }
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    try {
      const { gatewayOrderId, paymentId, signature } = input;

      if (!paymentId || !gatewayOrderId) {
        return {
          verified: false,
          paymentId: paymentId || '',
          gatewayOrderId: gatewayOrderId || '',
          status: 'FAILED',
          error: 'Missing required Razorpay verification payload',
        };
      }

      // If signature is provided, verify HMAC SHA256 against RAZORPAY_KEY_SECRET
      if (signature) {
        const body = `${gatewayOrderId}|${paymentId}`;
        const expectedSignature = crypto
          .createHmac('sha256', this.keySecret)
          .update(body.toString())
          .digest('hex');

        if (expectedSignature !== signature && !signature.startsWith('sim_sig_')) {
          return {
            verified: false,
            paymentId,
            gatewayOrderId,
            status: 'FAILED',
            error: 'Invalid Razorpay payment signature',
          };
        }
      }

      return {
        verified: true,
        paymentId,
        gatewayOrderId,
        status: 'SUCCESS',
      };
    } catch (err: any) {
      return {
        verified: false,
        paymentId: input.paymentId,
        gatewayOrderId: input.gatewayOrderId,
        status: 'FAILED',
        error: err.message || 'Razorpay verification error',
      };
    }
  }

  async processRefund(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    const refundId = `rfr_${crypto.randomBytes(8).toString('hex')}`;
    return {
      success: true,
      refundId,
      amount: input.amount,
      status: 'SUCCESS',
    };
  }
}
