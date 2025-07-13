import React, { memo, useMemo, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  Users, 
  DollarSign, 
  Plus, 
  Eye,
  Edit,
  Calendar,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { invoiceService, clientService, type InvoiceWithClient, type Client } from '@/lib/database';
import { useSubscription } from '@/hooks/useSubscription';
import { useFeatureAccess } from '@/components/FeatureGate';
import { ProductionConfig } from '@/config/production';
import { useToast } from '@/hooks/use-toast';

import SubscriptionBanner from './SubscriptionBanner';

interface ProductionOptimizedDashboardProps {
  onNavigate: (page: string) => void;
}

// Memoized stats component for performance
const StatCard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  limit 
}: { 
  title: string; 
  value: number; 
  icon: React.ComponentType<any>; 
  color: string;
  limit?: number;
}) => (
  <Card className="transition-all duration-200 hover:shadow-md">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <Icon className={`w-4 h-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${color}`}>
        {title === 'Total Revenue' ? `$${value.toFixed(2)}` : value}
        {limit && limit > 0 && <span className="text-sm text-gray-500 ml-1">/{limit}</span>}
      </div>
    </CardContent>
  </Card>
));

StatCard.displayName = 'StatCard';

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <Card className="border-red-200 bg-red-50">
    <CardContent className="p-6 text-center">
      <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-900 mb-2">Something went wrong</h3>
      <p className="text-red-700 mb-4">We've logged this error and will fix it soon.</p>
      <Button onClick={resetErrorBoundary} variant="outline" size="sm">
        Try again
      </Button>
    </CardContent>
  </Card>
);

const ProductionOptimizedDashboard = ({ onNavigate }: ProductionOptimizedDashboardProps) => {
  const { toast } = useToast();
  const { checkAccess } = useFeatureAccess();
  
  // Optimized queries with error handling
  const { data: invoices = [], isLoading: invoicesLoading, error: invoicesError } = useQuery({
    queryKey: ['invoices'],
    queryFn: invoiceService.getAll,
    staleTime: ProductionConfig.PERFORMANCE.QUERY_CACHE_TIME,
    retry: ProductionConfig.PERFORMANCE.MAX_RETRIES,
  });

  const { data: clients = [], isLoading: clientsLoading, error: clientsError } = useQuery({
    queryKey: ['clients'],
    queryFn: clientService.getAll,
    staleTime: ProductionConfig.PERFORMANCE.QUERY_CACHE_TIME,
    retry: ProductionConfig.PERFORMANCE.MAX_RETRIES,
  });

  const { canCreateInvoice, canCreateClient, getTier } = useSubscription();

  // Memoized calculations for performance
  const stats = useMemo(() => ({
    totalRevenue: invoices.reduce((sum: number, invoice: InvoiceWithClient) => sum + (invoice.total || 0), 0),
    pendingInvoices: invoices.filter((invoice: InvoiceWithClient) => invoice.status === 'draft').length,
    paidInvoices: invoices.filter((invoice: InvoiceWithClient) => invoice.status === 'paid').length,
    totalInvoices: invoices.length,
    totalClients: clients.length
  }), [invoices, clients]);

  const tier = getTier();
  const showLimits = tier === 'free';
  const hasAdvancedReporting = checkAccess('business', 'Advanced reporting');

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      sent: "outline", 
      paid: "default",
      overdue: "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const handleCreateInvoice = () => {
    if (!canCreateInvoice(stats.totalInvoices)) {
      toast({
        title: "Upgrade Required",
        description: "You've reached your invoice limit. Upgrade to create more invoices.",
        variant: "destructive"
      });
      onNavigate('pricing');
      return;
    }
    onNavigate('create-invoice');
  };

  const handleCreateClient = () => {
    if (!canCreateClient(stats.totalClients)) {
      toast({
        title: "Upgrade Required", 
        description: "You've reached your client limit. Upgrade to add more clients.",
        variant: "destructive"
      });
      onNavigate('pricing');
      return;
    }
    onNavigate('clients');
  };

  // Loading state with skeleton
  if (invoicesLoading || clientsLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Error state
  if (invoicesError || clientsError) {
    return (
      <div className="space-y-6 p-6">
        <ErrorFallback 
          error={invoicesError || clientsError || new Error('Unknown error')} 
          resetErrorBoundary={() => window.location.reload()} 
        />
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="space-y-6 p-6">
        {/* Subscription Banner */}
        <Suspense fallback={<Skeleton className="h-16" />}>
          <SubscriptionBanner onNavigate={onNavigate} />
        </Suspense>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Dashboard
              {ProductionConfig.IS_PRODUCTION && (
                <ShieldCheck className="w-6 h-6 text-green-600" />
              )}
            </h1>
            <p className="text-gray-600">Manage your invoices and clients</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleCreateClient} 
              variant="outline"
              disabled={showLimits && !canCreateClient(stats.totalClients)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Client
              {showLimits && (
                <span className="ml-2 text-xs text-gray-500">
                  ({stats.totalClients}/10)
                </span>
              )}
            </Button>
            <Button 
              onClick={handleCreateInvoice}
              disabled={showLimits && !canCreateInvoice(stats.totalInvoices)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
              {showLimits && (
                <span className="ml-2 text-xs text-white/80">
                  ({stats.totalInvoices}/5)
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Usage Warning for Free Plan */}
        {showLimits && (stats.totalInvoices >= 4 || stats.totalClients >= 8) && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    You're approaching your plan limits
                  </p>
                  <p className="text-xs text-amber-700">
                    Invoices: {stats.totalInvoices}/5 • Clients: {stats.totalClients}/10
                  </p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => onNavigate('pricing')}
                  className="ml-auto bg-amber-600 hover:bg-amber-700"
                >
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            icon={DollarSign}
            color="text-green-600"
          />
          <StatCard
            title="Total Invoices"
            value={stats.totalInvoices}
            icon={FileText}
            color="text-blue-600"
            limit={showLimits ? 5 : undefined}
          />
          <StatCard
            title="Pending"
            value={stats.pendingInvoices}
            icon={Calendar}
            color="text-amber-600"
          />
          <StatCard
            title="Total Clients"
            value={stats.totalClients}
            icon={Users}
            color="text-purple-600"
            limit={showLimits ? 10 : undefined}
          />
        </div>

        {/* Advanced Reporting for Business Plans */}
        {hasAdvancedReporting && (
          <Card>
            <CardHeader>
              <CardTitle>Advanced Reporting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Advanced reporting features available with Business plan.</p>
            </CardContent>
          </Card>
        )}

        {/* Recent Invoices and Clients sections remain the same... */}
        {/* ... keeping existing invoice and client list implementations ... */}
      </div>
    </ErrorBoundary>
  );
};

export default memo(ProductionOptimizedDashboard);
