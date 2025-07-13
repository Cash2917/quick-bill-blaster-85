import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CreditCard, Lock, Check } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { rateLimiter, SecurityConfig, securityLogger } from '@/lib/security';
import { useToast } from '@/hooks/use-toast';
import { PLANS, type PlanType } from '@/lib/stripe';

interface SecurePaymentFormProps {
  planType: PlanType;
  onClose?: () => void;
}

export const SecurePaymentForm = ({ planType, onClose }: SecurePaymentFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { createCheckoutSession } = useSubscription();
  const { toast } = useToast();
  
  const plan = PLANS[planType];

  const handlePayment = async () => {
    // Rate limiting for payment attempts
    if (!rateLimiter.isAllowed('payment_attempt', SecurityConfig.RATE_LIMITS.PAYMENT_ATTEMPTS_PER_HOUR)) {
      securityLogger.logRateLimitHit('payment_attempt');
      toast({
        title: "Security Notice",
        description: "Too many payment attempts. Please wait before trying again.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      securityLogger.logSecurityEvent('PAYMENT_INITIATED', { plan: planType });
      
      const checkoutUrl = await createCheckoutSession(plan.priceId!);
      
      if (checkoutUrl) {
        // Secure redirect to Stripe
        window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
        onClose?.();
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error: any) {
      securityLogger.logSecurityEvent('PAYMENT_ERROR', { 
        plan: planType, 
        error: error.message 
      });
      
      toast({
        title: "Payment Error",
        description: "Unable to process payment. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-green-100 p-3 rounded-full">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-xl">
          Secure Payment for {plan.name}
        </CardTitle>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Lock className="w-4 h-4" />
          <span>256-bit SSL Encryption</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Plan Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">{plan.name} Plan</span>
            <Badge variant="outline">${plan.price}/month</Badge>
          </div>
          <ul className="space-y-1 text-sm text-gray-600">
            {plan.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check className="w-3 h-3 text-green-600" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Security Features */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Security Features</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              PCI DSS Compliant Processing
            </li>
            <li className="flex items-center gap-2">
              <Lock className="w-3 h-3" />
              End-to-End Encryption
            </li>
            <li className="flex items-center gap-2">
              <CreditCard className="w-3 h-3" />
              Secure Card Storage
            </li>
          </ul>
        </div>

        {/* Payment Button */}
        <Button 
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Continue to Secure Payment
            </>
          )}
        </Button>

        {/* Trust Indicators */}
        <div className="text-center text-xs text-gray-500">
          <p>Payments processed securely by Stripe</p>
          <p>Your card information is never stored on our servers</p>
        </div>
      </CardContent>
    </Card>
  );
};