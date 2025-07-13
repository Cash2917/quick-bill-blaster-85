import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS } from '@/lib/stripe';

const SubscriptionPlans = () => {
  const { toast } = useToast();
  const { subscription, loading, createCheckoutSession, getTier } = useSubscription();

  const handleSubscribe = async (planKey: string) => {
    const plan = PLANS[planKey as keyof typeof PLANS];
    
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

  const currentTier = getTier();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600">Select the perfect plan for your invoicing needs</p>
        {subscription && (
          <div className="mt-4">
            <Badge variant="outline" className="text-sm">
              Current Plan: {PLANS[currentTier].name}
            </Badge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(PLANS).map(([planKey, plan]) => {
          const isCurrentPlan = currentTier === planKey;
          const isPopular = planKey === 'pro';
          
          return (
            <Card 
              key={planKey} 
              className={`relative ${isPopular ? 'border-blue-500 border-2 scale-105' : ''} ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
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
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="pt-4">
                  <Button 
                    onClick={() => handleSubscribe(planKey)}
                    className={`w-full ${
                      isCurrentPlan 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : isPopular 
                          ? 'bg-blue-500 hover:bg-blue-600' 
                          : 'bg-green-600 hover:bg-green-700'
                    }`}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan 
                      ? 'Current Plan' 
                      : planKey === 'free' 
                        ? 'Get Started' 
                        : `Subscribe to ${plan.name}`
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">
          All plans include secure data storage, automatic backups, and 24/7 support.
        </p>
        <p className="text-sm text-gray-500">
          You can upgrade, downgrade, or cancel your subscription at any time.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;