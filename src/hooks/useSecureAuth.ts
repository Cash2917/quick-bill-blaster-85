import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { rateLimiter, SecurityConfig, sessionManager, securityLogger } from '@/lib/security';
import { useToast } from '@/hooks/use-toast';

/**
 * Enhanced authentication hook with security features
 */
export const useSecureAuth = () => {
  const auth = useAuth();
  const { toast } = useToast();

  // Session monitoring
  useEffect(() => {
    const checkSession = () => {
      if (auth.user) {
        const lastActivity = sessionManager.getLastActivity();
        
        if (sessionManager.isSessionExpired(lastActivity)) {
          securityLogger.logSecurityEvent('SESSION_EXPIRED', { userId: auth.user.id });
          auth.signOut();
          toast({
            title: "Session Expired",
            description: "You've been signed out due to inactivity.",
            variant: "destructive"
          });
        }
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [auth.user, auth.signOut, toast]);

  // Update activity on user interaction
  useEffect(() => {
    const updateActivity = () => {
      if (auth.user) {
        sessionManager.updateLastActivity();
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [auth.user]);

  const secureSignIn = useCallback(async (email: string, password: string) => {
    // Rate limiting
    if (!rateLimiter.isAllowed('auth_attempt', SecurityConfig.RATE_LIMITS.AUTH_ATTEMPTS_PER_HOUR)) {
      const remaining = rateLimiter.getRemainingAttempts('auth_attempt', SecurityConfig.RATE_LIMITS.AUTH_ATTEMPTS_PER_HOUR);
      securityLogger.logRateLimitHit('auth_attempt', email);
      
      toast({
        title: "Too Many Attempts",
        description: `Please wait before trying again. Remaining attempts: ${remaining}`,
        variant: "destructive"
      });
      return { error: { message: 'Rate limit exceeded' } };
    }

    try {
      const result = await auth.signIn(email, password);
      
      if (result.error) {
        securityLogger.logFailedAuth(email, result.error.message);
      } else {
        sessionManager.updateLastActivity();
        securityLogger.logSecurityEvent('AUTH_SUCCESS', { email });
      }
      
      return result;
    } catch (error: any) {
      securityLogger.logFailedAuth(email, error.message);
      return { error };
    }
  }, [auth, toast]);

  const secureSignUp = useCallback(async (email: string, password: string) => {
    // Rate limiting
    if (!rateLimiter.isAllowed('auth_attempt', SecurityConfig.RATE_LIMITS.AUTH_ATTEMPTS_PER_HOUR)) {
      securityLogger.logRateLimitHit('auth_attempt', email);
      
      toast({
        title: "Too Many Attempts",
        description: "Please wait before trying again.",
        variant: "destructive"
      });
      return { error: { message: 'Rate limit exceeded' } };
    }

    try {
      const result = await auth.signUp(email, password);
      
      if (result.error) {
        securityLogger.logFailedAuth(email, result.error.message);
      } else {
        sessionManager.updateLastActivity();
        securityLogger.logSecurityEvent('SIGNUP_SUCCESS', { email });
      }
      
      return result;
    } catch (error: any) {
      securityLogger.logFailedAuth(email, error.message);
      return { error };
    }
  }, [auth, toast]);

  const secureSignOut = useCallback(async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('last_activity');
      securityLogger.logSecurityEvent('LOGOUT_SUCCESS', { userId: auth.user?.id });
    } catch (error: any) {
      securityLogger.logSecurityEvent('LOGOUT_ERROR', { error: error.message });
    }
  }, [auth]);

  return {
    ...auth,
    signIn: secureSignIn,
    signUp: secureSignUp,
    signOut: secureSignOut
  };
};