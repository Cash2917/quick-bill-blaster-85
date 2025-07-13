import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51RSllgRD1hxs4eDXZ25BsePqQM7uHr4wzBjjkYwr9cp1SujpxPdMeKEyHNtRJCaEzOrkP2aD3wBQdedmeXFsxQTX00MVR18NHr');

export { stripePromise };

// Stripe price IDs - replace these with your actual Stripe price IDs
export const STRIPE_PRICES = {
  pro: 'price_1234567890abcdef', // Replace with your actual Pro plan price ID
  business: 'price_0987654321fedcba', // Replace with your actual Business plan price ID
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