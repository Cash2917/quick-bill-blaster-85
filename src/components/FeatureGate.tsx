import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap, Shield } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS, type PlanType } from '@/lib/stripe';

interface FeatureGateProps {
  children: React.ReactNode;
  requiredTier: PlanType;
  feature: string;
  onUpgrade?: () => void;
  fallback?: React.ReactNode;
}

export const FeatureGate = ({ 
  children, 
  requiredTier, 
  feature, 
  onUpgrade,
  fallback 
}: FeatureGateProps) => {
  const { getTier, hasFeature } = useSubscription();
  const currentTier = getTier();
  const hasAccess = hasFeature(feature) || currentTier === requiredTier || 
                   (requiredTier === 'pro' && currentTier === 'business');

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const requiredPlan = PLANS[requiredTier];
  const tierIcons = {
    free: null,
    pro: <Crown className="w-5 h-5 text-yellow-600" />,
    business: <Shield className="w-5 h-5 text-purple-600" />
  };

  return (
    <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
      <CardHeader className="text-center pb-3">
        <div className="flex items-center justify-center mb-2">
          <div className="bg-gray-100 p-3 rounded-full mr-3">
            <Lock className="w-6 h-6 text-gray-600" />
          </div>
          {tierIcons[requiredTier]}
        </div>
        <CardTitle className="text-lg text-gray-700">
          {requiredPlan.name} Feature
        </CardTitle>
      </CardHeader>
      
      <CardContent className="text-center space-y-4">
        <div>
          <Badge variant="outline" className="mb-2">
            {feature}
          </Badge>
          <p className="text-sm text-gray-600">
            This feature is available with the {requiredPlan.name} plan
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium mb-2">What you'll get:</h4>
          <ul className="text-sm text-left space-y-1">
            {requiredPlan.features.slice(0, 3).map((feat, index) => (
              <li key={index} className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-green-600" />
                {feat}
              </li>
            ))}
          </ul>
        </div>

        <Button 
          onClick={onUpgrade}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          Upgrade to {requiredPlan.name} - ${requiredPlan.price}/month
        </Button>

        <p className="text-xs text-gray-500">
          30-day money-back guarantee • Cancel anytime
        </p>
      </CardContent>
    </Card>
  );
};

/**
 * Hook for checking feature access
 */
export const useFeatureAccess = () => {
  const { getTier, hasFeature, isSubscribed } = useSubscription();

  const checkAccess = (requiredTier: PlanType, feature?: string): boolean => {
    const currentTier = getTier();
    
    // Check by tier hierarchy
    if (currentTier === 'business') return true;
    if (currentTier === 'pro' && requiredTier !== 'business') return true;
    if (currentTier === 'free' && requiredTier === 'free') return true;
    
    // Check by specific feature
    if (feature) {
      return hasFeature(feature);
    }
    
    return false;
  };

  const getAccessLevel = (): { tier: PlanType; isSubscribed: boolean } => ({
    tier: getTier(),
    isSubscribed: isSubscribed()
  });

  return {
    checkAccess,
    getAccessLevel,
    hasFeature,
    isSubscribed
  };
};