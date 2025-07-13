import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clientService } from '@/lib/database';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  notes: string;
}

const ClientForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
    notes: ''
  });

  const createClientMutation = useMutation({
    mutationFn: clientService.create,
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Client added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'United States',
        notes: ''
      });
    },
    onError: (error) => {
      console.error('Client creation error:', error);
      toast({
        title: "Error",
        description: "Failed to add client. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Client name is required",
        variant: "destructive"
      });
      return;
    }

    createClientMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Client</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Client Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter client name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="client@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Company name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Street address"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                />
              </div>
              
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State"
                />
              </div>
              
              <div>
                <Label htmlFor="zip_code">ZIP Code</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => handleInputChange('zip_code', e.target.value)}
                  placeholder="12345"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="Country"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this client"
                rows={3}
              />
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={createClientMutation.isPending}
                className="w-full md:w-auto flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {createClientMutation.isPending ? 'Saving...' : 'Save Client'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ClientForm;