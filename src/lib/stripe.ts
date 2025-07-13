import { loadStripe } from '@stripe/stripe-js';
import { getStripeConfig } from '@/config/production';

// Initialize Stripe with environment-specific configuration
const stripeConfig = getStripeConfig();
const stripePromise = loadStripe(stripeConfig.publishableKey);

export { stripePromise };

// Environment-specific Stripe price IDs
export const STRIPE_PRICES = {
  pro: stripeConfig.priceIds.pro,
  business: stripeConfig.priceIds.business,
};

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '5 invoices per month',
      'Basic templates',
      'Email support',
      'Basic client management'
    ],
    limits: {
      invoices: 5,
      clients: 10
    }
  },
  pro: {
    name: 'Pro',
    price: 9,
    priceId: STRIPE_PRICES.pro,
    features: [
      'Unlimited invoices',
      'Custom templates',
      'Priority support',
      'Advanced reporting',
      'Client portal',
      'Payment tracking'
    ],
    limits: {
      invoices: -1, // unlimited
      clients: -1   // unlimited
    }
  },
  business: {
    name: 'Business',
    price: 19,
    priceId: STRIPE_PRICES.business,
    features: [
      'Everything in Pro',
      'Multi-user accounts',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'White-label options'
    ],
    limits: {
      invoices: -1, // unlimited
      clients: -1   // unlimited
    }
  }
} as const;

export type PlanType = keyof typeof PLANS;