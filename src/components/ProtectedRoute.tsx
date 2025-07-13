
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, UserPlus } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onShowAuth: () => void;
}

export const ProtectedRoute = ({ children, onShowAuth }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Authentication Required
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600">
              Please sign in to access your dashboard and create invoices.
            </p>
            
            <div className="space-y-3">
              <Button onClick={onShowAuth} className="w-full bg-green-600 hover:bg-green-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Sign In / Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
