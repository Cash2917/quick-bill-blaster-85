import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { useToast } from '@/hooks/use-toast';
import { GOOGLE_CLIENT_ID, isGoogleConfigured } from '@/lib/google-auth';
import { Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export const GoogleSignInButton = ({ 
  onSuccess, 
  onError, 
  disabled = false,
  className = ""
}: GoogleSignInButtonProps) => {
  const { signInWithGoogle, loading } = useCustomAuth();
  const { toast } = useToast();
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isGoogleConfigured()) {
      console.error('Google Client ID not configured');
      return;
    }

    if (!window.google || !buttonRef.current) {
      return;
    }

    // Configure Google Sign-In callback
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Render Google Sign-In button
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: '100%',
    });
  }, []);

  const handleGoogleResponse = async (response: any) => {
    if (!response.credential) {
      const error = 'No credential received from Google';
      console.error(error);
      onError?.(error);
      toast({
        title: "Sign In Failed",
        description: error,
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await signInWithGoogle(response.credential);
      
      if (error) {
        console.error('Google sign in error:', error);
        onError?.(error.message);
        toast({
          title: "Sign In Failed",
          description: error.message || "Failed to sign in with Google",
          variant: "destructive"
        });
      } else {
        onSuccess?.();
        toast({
          title: "Welcome!",
          description: "Successfully signed in with Google",
        });
      }
    } catch (error: any) {
      console.error('Unexpected error during Google sign in:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      onError?.(errorMessage);
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleFallbackSignIn = () => {
    if (!window.google) {
      toast({
        title: "Google Sign-In Unavailable",
        description: "Please refresh the page and try again",
        variant: "destructive"
      });
      return;
    }

    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.log('Google Sign-In prompt not displayed or skipped');
      }
    });
  };

  if (!isGoogleConfigured()) {
    return (
      <Button disabled className={className}>
        Google Sign-In Not Configured
      </Button>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Google's rendered button */}
      <div ref={buttonRef} className="w-full" />
      
      {/* Fallback button if Google button doesn't render */}
      <Button
        onClick={handleFallbackSignIn}
        disabled={disabled || loading}
        variant="outline"
        className="w-full mt-2 border-gray-300 hover:bg-gray-50"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </>
        )}
      </Button>
    </div>
  );
};