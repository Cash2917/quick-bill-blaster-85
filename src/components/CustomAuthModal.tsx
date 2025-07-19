import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GoogleSignInButton } from './GoogleSignInButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle } from 'lucide-react';

interface CustomAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomAuthModal = ({ isOpen, onClose }: CustomAuthModalProps) => {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignInSuccess = () => {
    setIsSigningIn(false);
    onClose();
  };

  const handleSignInError = (error: string) => {
    setIsSigningIn(false);
    console.error('Sign in error:', error);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Welcome to HonestInvoice
          </DialogTitle>
        </DialogHeader>
        
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-lg text-gray-900">
              Secure Sign In
            </CardTitle>
            <p className="text-sm text-gray-600">
              Sign in with your Google account to access your invoices and manage your business.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <GoogleSignInButton
              onSuccess={handleSignInSuccess}
              onError={handleSignInError}
              disabled={isSigningIn}
              className="w-full"
            />
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 text-sm">Why Google Sign-In?</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Secure authentication with Google</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>No passwords to remember</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Quick and easy access</span>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              Your data is encrypted and secure.
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};