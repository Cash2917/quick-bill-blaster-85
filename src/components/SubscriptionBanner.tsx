import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, AlertCircle, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionBannerProps {
  onNavigate: (page: string) => void;
}

const SubscriptionBanner = ({ onNavigate }: SubscriptionBannerProps) => {
  const { subscription, getTier, getUsageInfo, createCheckoutSession } = useSubscription();

  const tier = getTier();
  const usageInfo = getUsageInfo();

  if (tier === 'business') {
    return null; // Don't show banner for business plan users
  }

  const handleUpgrade = async () => {
    if (tier === 'free') {
      // Upgrade to Pro
      const checkoutUrl = await createCheckoutSession('price_1234567890abcdef');
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
      }
    } else if (tier === 'pro') {
      // Upgrade to Business
      const checkoutUrl = await createCheckoutSession('price_0987654321fedcba');
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
      }
    }
  };

  return (
    <Card className="mb-6 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {tier === 'free' ? (
                <Zap className="w-6 h-6 text-blue-500" />
              ) : (
                <Crown className="w-6 h-6 text-blue-500" />
              )}
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {tier === 'free' ? 'You\'re on the Free Plan' : `${usageInfo.plan} Plan`}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {tier === 'free' ? 'Limited' : 'Active'}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600">
                {tier === 'free' 
                  ? 'Upgrade to unlock unlimited invoices and advanced features'
                  : tier === 'pro'
                    ? 'Upgrade to Business for multi-user accounts and API access'
                    : 'You have access to all features'
                }
              </p>
              
              {tier === 'free' && (
                <div className="flex items-center mt-2 text-xs text-amber-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span>Limited to 5 invoices and 10 clients</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate('pricing')}
            >
              View Plans
            </Button>
            
            {tier === 'free' && (
              <Button 
                size="sm"
                onClick={handleUpgrade}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Crown className="w-4 h-4 mr-1" />
                Upgrade
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionBanner;