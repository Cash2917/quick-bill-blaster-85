import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PLANS, type PlanType } from '@/lib/stripe';

interface Subscription {
  subscribed: boolean;
  subscription_tier: PlanType;
  subscription_end: string | null;
  stripe_customer_id: string | null;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, session } = useAuth();

  useEffect(() => {
    if (user && session) {
      fetchSubscription();
    } else {
      setSubscription({ 
        subscribed: false, 
        subscription_tier: 'free', 
        subscription_end: null,
        stripe_customer_id: null
      });
      setLoading(false);
    }
  }, [user, session]);

  const fetchSubscription = async () => {
    if (!user || !session?.access_token) {
      setSubscription({ 
        subscribed: false, 
        subscription_tier: 'free', 
        subscription_end: null,
        stripe_customer_id: null
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, subscription_end, stripe_customer_id')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSubscription(data ? {
        ...data,
        subscription_tier: (data.subscription_tier as PlanType) || 'free'
      } : { 
        subscribed: false, 
        subscription_tier: 'free', 
        subscription_end: null,
        stripe_customer_id: null
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!session?.access_token) return;

    try {
      await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      // Refetch subscription data after checking
      await fetchSubscription();
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const createCheckoutSession = async (priceId: string) => {
    if (!session?.access_token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          successUrl: `${window.location.origin}/subscription-success`,
          cancelUrl: `${window.location.origin}/#pricing`
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      return data?.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const isSubscribed = () => {
    return subscription?.subscribed || false;
  };

  const getTier = (): PlanType => {
    return (subscription?.subscription_tier as PlanType) || 'free';
  };

  const hasFeature = (feature: string) => {
    const tier = getTier();
    const plan = PLANS[tier];
    return plan.features.some(f => f.toLowerCase().includes(feature.toLowerCase()));
  };

  const canCreateInvoice = (currentCount: number) => {
    const tier = getTier();
    const limit = PLANS[tier].limits.invoices;
    return limit === -1 || currentCount < limit;
  };

  const canCreateClient = (currentCount: number) => {
    const tier = getTier();
    const limit = PLANS[tier].limits.clients;
    return limit === -1 || currentCount < limit;
  };

  const getUsageInfo = () => {
    const tier = getTier();
    const plan = PLANS[tier];
    return {
      plan: plan.name,
      price: plan.price,
      features: plan.features,
      limits: plan.limits
    };
  };

  return {
    subscription,
    loading,
    isSubscribed,
    getTier,
    hasFeature,
    canCreateInvoice,
    canCreateClient,
    getUsageInfo,
    refetch: fetchSubscription,
    checkSubscriptionStatus,
    createCheckoutSession
  };
};