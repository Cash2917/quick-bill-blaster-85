import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { customAuth, type CustomUser, type CustomSession } from '@/lib/custom-auth';
import { initializeGoogleAuth, signOutFromGoogle } from '@/lib/google-auth';
import { sessionManager, securityLogger } from '@/lib/security';

interface CustomAuthContextType {
  user: CustomUser | null;
  session: CustomSession | null;
  loading: boolean;
  signInWithGoogle: (credential: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const CustomAuthContext = createContext<CustomAuthContextType | undefined>(undefined);

export const useCustomAuth = () => {
  const context = useContext(CustomAuthContext);
  if (context === undefined) {
    throw new Error('useCustomAuth must be used within a CustomAuthProvider');
  }
  return context;
};

interface CustomAuthProviderProps {
  children: ReactNode;
}

export const CustomAuthProvider = ({ children }: CustomAuthProviderProps) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [session, setSession] = useState<CustomSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('CustomAuthProvider initializing...');
    
    // Initialize Google Auth
    initializeGoogleAuth().catch(error => {
      console.error('Failed to initialize Google Auth:', error);
    });

    // Set up auth state listener
    const unsubscribe = customAuth.onAuthStateChange((newSession) => {
      console.log('Auth state changed:', newSession?.user?.email || 'No session');
      setSession(newSession);
      setUser(newSession?.user || null);
      setLoading(false);
    });

    // Get initial session
    const initialSession = customAuth.getSession();
    console.log('Initial session:', initialSession?.user?.email || 'No session');
    setSession(initialSession);
    setUser(initialSession?.user || null);
    setLoading(false);

    return unsubscribe;
  }, []);

  // Session monitoring
  useEffect(() => {
    const checkSession = () => {
      if (user) {
        const lastActivity = sessionManager.getLastActivity();
        
        if (sessionManager.isSessionExpired(lastActivity)) {
          securityLogger.logSecurityEvent('SESSION_EXPIRED', { userId: user.id });
          signOut();
        }
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user]);

  // Update activity on user interaction
  useEffect(() => {
    const updateActivity = () => {
      if (user) {
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
  }, [user]);

  const signInWithGoogle = async (credential: string) => {
    try {
      setLoading(true);
      console.log('Attempting Google sign in...');
      
      const { user: newUser, error } = await customAuth.signInWithGoogle(credential);

      if (error) {
        console.error('Google sign in error:', error);
        return { error };
      }

      console.log('Google sign in successful for:', newUser?.email);
      return { error: null };
    } catch (error: any) {
      console.error('Unexpected Google sign in error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Signing out...');
      
      await customAuth.signOut();
      signOutFromGoogle();
      
      // Clear security-related localStorage
      localStorage.removeItem('last_activity');
      
      console.log('Sign out successful');
    } catch (error: any) {
      console.error('Unexpected sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
    isAuthenticated: customAuth.isAuthenticated(),
  };

  return <CustomAuthContext.Provider value={value}>{children}</CustomAuthContext.Provider>;
};