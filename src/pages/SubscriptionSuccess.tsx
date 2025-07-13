
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const SubscriptionSuccess = () => {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Subscription successful!",
      description: "Welcome to your new plan. You now have access to all premium features.",
    });
  }, [toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Subscription Successful!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <p className="text-gray-600">
            Thank you for subscribing! Your payment has been processed successfully and your account has been upgraded.
          </p>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;
