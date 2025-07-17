import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CreditCard, Lock } from 'lucide-react';
import { stripePromise, isStripeConfigured } from '@/lib/stripe';

interface PaymentFormProps {
  priceId: string;
  planName: string;
  amount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const PaymentForm = ({ priceId, planName, amount, onSuccess, onCancel }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user || !session) {
      toast({
        title: "Error",
        description: "Payment system not ready or user not authenticated",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Create checkout session via Supabase Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/subscription-success`,
          cancelUrl: `${window.location.origin}/#pricing`
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
        onSuccess?.();
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isStripeConfigured()) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-4">
            <CreditCard className="w-12 h-12 mx-auto mb-2" />
            <h3 className="font-semibold">Payment System Unavailable</h3>
            <p className="text-sm text-gray-600 mt-2">
              Stripe is not configured. Please contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Subscribe to {planName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">{planName} Plan</span>
              <span className="text-lg font-bold">${amount}/month</span>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <CardElement options={cardElementOptions} />
          </div>

          <div className="space-y-2">
            <Button
              type="submit"
              disabled={!stripe || loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Subscribe for ${amount}/month
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full"
              >
                Cancel
              </Button>
            )}
          </div>

          <div className="text-xs text-gray-500 text-center space-y-1">
            <p className="flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              Secure payment processed by Stripe
            </p>
            <p>Your card information is encrypted and secure</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

interface StripePaymentFormProps extends PaymentFormProps {}

const StripePaymentForm = (props: StripePaymentFormProps) => {
  if (!isStripeConfigured()) {
    return <PaymentForm {...props} />;
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default StripePaymentForm;