import { PaymentProvider } from './provider';
import { RazorpayPaymentProvider } from './razorpay';
import { StripePaymentProvider } from './stripe';

const providers: Record<string, PaymentProvider> = {
  razorpay: new RazorpayPaymentProvider(),
  stripe: new StripePaymentProvider(),
};

export function getPaymentProvider(gatewayName: string = 'razorpay'): PaymentProvider {
  const normalized = gatewayName.toLowerCase();
  if (providers[normalized]) {
    return providers[normalized];
  }
  return providers['razorpay'];
}

export * from './provider';
