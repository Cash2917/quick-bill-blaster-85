import { loadStripe } from '@stripe/stripe-js';

// Get Stripe publishable key from environment
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

console.log('Stripe publishable key configured:', !!stripePublishableKey);

// Initialize Stripe
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export { stripePromise };

// Stripe price IDs - replace with your actual Stripe price IDs from your dashboard
export const STRIPE_PRICES = {
  pro: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || '',
  business: import.meta.env.VITE_STRIPE_BUSINESS_PRICE_ID || '',
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

// Stripe configuration validation
export const isStripeConfigured = (): boolean => {
  return !!stripePublishableKey;
};

// Get Stripe instance
export const getStripe = async () => {
  if (!stripePromise) {
    throw new Error('Stripe is not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY.');
  }
  return await stripePromise;
};