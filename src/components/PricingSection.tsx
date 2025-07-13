import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS } from '@/lib/stripe';

interface PricingSectionProps {
  onNavigate?: (page: string) => void;
  onShowAuth?: () => void;
}

const PricingSection = ({ onNavigate, onShowAuth }: PricingSectionProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { createCheckoutSession, getTier } = useSubscription();

  const handleSubscribe = async (planKey: string) => {
    const plan = PLANS[planKey as keyof typeof PLANS];
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive"
      });
      if (onShowAuth) {
        onShowAuth();
      }
      return;
    }

    if (planKey === 'free') {
      toast({
        title: "You're already on the free plan!",
        description: "Upgrade to access more features.",
      });
      return;
    }

    if (!plan.priceId) {
      toast({
        title: "Error",
        description: "This plan is not available for subscription.",
        variant: "destructive"
      });
      return;
    }

    const checkoutUrl = await createCheckoutSession(plan.priceId);
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    }
  };

  const currentTier = user ? getTier() : 'free';

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your business needs. Start managing your invoices professionally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(PLANS).map(([planKey, plan]) => {
            const isCurrentPlan = user && currentTier === planKey;
            const isPopular = planKey === 'pro';
            
            return (
              <Card 
                key={planKey} 
                className={`relative ${isPopular ? 'border-blue-500 border-2 scale-105 shadow-lg' : 'border-gray-200 shadow-md'} ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600">
                    <Crown className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                
                {isCurrentPlan && (
                  <Badge className="absolute -top-3 right-4 bg-green-500 hover:bg-green-600">
                    Current Plan
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    {planKey === 'free' && <Zap className="w-8 h-8 text-gray-500" />}
                    {planKey === 'pro' && <Crown className="w-8 h-8 text-blue-500" />}
                    {planKey === 'business' && <Crown className="w-8 h-8 text-purple-500" />}
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </CardTitle>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    {plan.price > 0 && <span className="text-gray-600">/month</span>}
                  </div>
                  
                  <p className="text-gray-600">
                    {planKey === 'free' && 'Perfect for getting started'}
                    {planKey === 'pro' && 'Perfect for small businesses'}
                    {planKey === 'business' && 'Perfect for growing companies'}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleSubscribe(planKey)}
                    className={`w-full ${
                      isCurrentPlan 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : isPopular 
                          ? 'bg-blue-500 hover:bg-blue-600' 
                          : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan 
                      ? 'Current Plan' 
                      : planKey === 'free' 
                        ? 'Get Started' 
                        : `Subscribe to ${plan.name}`
                    }
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!user && (
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Ready to get started? Create your account today.
            </p>
            <Button 
              onClick={onShowAuth}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              Sign Up Now
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingSection;