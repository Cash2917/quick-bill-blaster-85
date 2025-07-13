import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Users, 
  DollarSign, 
  Plus, 
  Eye,
  Edit,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { invoiceService, clientService, type InvoiceWithClient, type Client } from '@/lib/database';
import { useSubscription } from '@/hooks/useSubscription';
import SubscriptionBanner from './SubscriptionBanner';
import { useToast } from '@/hooks/use-toast';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const { toast } = useToast();
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: invoiceService.getAll
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: clientService.getAll
  });

  const { canCreateInvoice, canCreateClient, getTier } = useSubscription();

  // Calculate statistics
  const totalRevenue = invoices.reduce((sum: number, invoice: InvoiceWithClient) => sum + (invoice.total || 0), 0);
  const pendingInvoices = invoices.filter((invoice: InvoiceWithClient) => invoice.status === 'draft').length;
  const paidInvoices = invoices.filter((invoice: InvoiceWithClient) => invoice.status === 'paid').length;

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
    if (!canCreateInvoice(invoices.length)) {
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
    if (!canCreateClient(clients.length)) {
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

  const isLoading = invoicesLoading || clientsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const tier = getTier();
  const showLimits = tier === 'free';

  return (
    <div className="space-y-6 p-6">
      {/* Subscription Banner */}
      <SubscriptionBanner onNavigate={onNavigate} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Manage your invoices and clients</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleCreateClient} 
            variant="outline"
            disabled={showLimits && !canCreateClient(clients.length)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Client
            {showLimits && (
              <span className="ml-2 text-xs text-gray-500">
                ({clients.length}/10)
              </span>
            )}
          </Button>
          <Button 
            onClick={handleCreateInvoice}
            disabled={showLimits && !canCreateInvoice(invoices.length)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
            {showLimits && (
              <span className="ml-2 text-xs text-white/80">
                ({invoices.length}/5)
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Usage Warning for Free Plan */}
      {showLimits && (invoices.length >= 4 || clients.length >= 8) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  You're approaching your plan limits
                </p>
                <p className="text-xs text-amber-700">
                  Invoices: {invoices.length}/5 • Clients: {clients.length}/10
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Invoices</CardTitle>
            <FileText className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {invoices.length}
              {showLimits && <span className="text-sm text-gray-500 ml-1">/5</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            <Calendar className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingInvoices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Clients</CardTitle>
            <Users className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {clients.length}
              {showLimits && <span className="text-sm text-gray-500 ml-1">/10</span>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recent Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
              <p className="text-gray-600 mb-4">Create your first invoice to get started</p>
              <Button onClick={handleCreateInvoice}>
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.slice(0, 5).map((invoice: InvoiceWithClient) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{invoice.invoice_number}</h4>
                      {getStatusBadge(invoice.status || 'draft')}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {invoice.client_name || invoice.client?.name || 'No client'} • Due: {new Date(invoice.due_date || '').toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${(invoice.total || 0).toFixed(2)}</div>
                    <div className="flex gap-1 mt-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Recent Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
              <p className="text-gray-600 mb-4">Add your first client to get started</p>
              <Button onClick={handleCreateClient} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.slice(0, 5).map((client: Client) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <h4 className="font-medium">{client.name}</h4>
                    <p className="text-sm text-gray-600">
                      {client.email || 'No email'}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;