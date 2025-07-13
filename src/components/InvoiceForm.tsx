import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Save, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clientService, invoiceService, generateInvoiceNumber, type Client, type InvoiceItem } from '@/lib/database';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface InvoiceFormData {
  client_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  notes: string;
  tax_rate: number;
  items: InvoiceItem[];
}

const InvoiceForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<InvoiceFormData>({
    client_id: '',
    invoice_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    tax_rate: 0,
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: clientService.getAll
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);
      const tax_amount = subtotal * (data.tax_rate / 100);
      const total = subtotal + tax_amount;

      return invoiceService.create({
        client_id: data.client_id || null,
        invoice_number: data.invoice_number,
        issue_date: data.issue_date,
        due_date: data.due_date,
        subtotal,
        tax_rate: data.tax_rate,
        tax_amount,
        total,
        notes: data.notes,
        status: 'draft'
      }, data.items);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Invoice created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      // Reset form
      setFormData({
        client_id: '',
        invoice_number: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '',
        tax_rate: 0,
        items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
      });
    },
    onError: (error) => {
      console.error('Invoice creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    generateInvoiceNumber().then(number => {
      setFormData(prev => ({ ...prev, invoice_number: number }));
    }).catch(error => {
      console.error('Error generating invoice number:', error);
      // Fallback to timestamp-based number
      const timestamp = Date.now().toString().slice(-6);
      setFormData(prev => ({ ...prev, invoice_number: `INV-${timestamp}` }));
    });
  }, []);

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate amount
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const tax_amount = subtotal * (formData.tax_rate / 100);
    const total = subtotal + tax_amount;
    return { subtotal, tax_amount, total };
  };

  const { subtotal, tax_amount, total } = calculateTotals();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.invoice_number.trim()) {
      toast({
        title: "Error",
        description: "Invoice number is required",
        variant: "destructive"
      });
      return;
    }

    if (formData.items.some(item => !item.description.trim())) {
      toast({
        title: "Error",
        description: "All items must have a description",
        variant: "destructive"
      });
      return;
    }

    createInvoiceMutation.mutate(formData);
  };

  if (clientsLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createInvoiceMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {createInvoiceMutation.isPending ? 'Saving...' : 'Save Invoice'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Header */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_id">Client</Label>
              <Select 
                value={formData.client_id} 
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client: Client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="invoice_number">Invoice Number *</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="issue_date">Invoice Date *</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Invoice Items</CardTitle>
            <Button type="button" onClick={addItem} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Label>Description *</Label>
                  <Input
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <Label>Rate ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <Label>Amount</Label>
                  <Input
                    value={`$${item.amount.toFixed(2)}`}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={formData.items.length === 1}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Totals and Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Additional notes or payment terms..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="tax_rate">Tax Rate (%):</Label>
                <div className="w-20">
                  <Input
                    id="tax_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div className="flex justify-between">
                <span>Tax Amount:</span>
                <span>${tax_amount.toFixed(2)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;