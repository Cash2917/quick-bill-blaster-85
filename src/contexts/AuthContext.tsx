
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { sessionManager, securityLogger, validateInput, sanitizeInput } from '@/lib/security';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider initializing...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email || 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Input validation and sanitization
      const sanitizedEmail = sanitizeInput.email(email);
      if (!validateInput.email(sanitizedEmail)) {
        return { error: { message: 'Invalid email format' } };
      }

      const passwordValidation = validateInput.password(password);
      if (!passwordValidation.valid) {
        return { error: { message: passwordValidation.message } };
      }

      console.log('Attempting sign in for:', sanitizedEmail);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        securityLogger.logFailedAuth(sanitizedEmail, error.message);
        return { error };
      }

      console.log('Sign in successful for:', data.user?.email);
      sessionManager.updateLastActivity();
      securityLogger.logSecurityEvent('AUTH_SUCCESS', { email: sanitizedEmail });
      return { error: null };
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      securityLogger.logSecurityEvent('AUTH_ERROR', { error: error.message });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Input validation and sanitization
      const sanitizedEmail = sanitizeInput.email(email);
      if (!validateInput.email(sanitizedEmail)) {
        return { error: { message: 'Invalid email format' } };
      }

      const passwordValidation = validateInput.password(password);
      if (!passwordValidation.valid) {
        return { error: { message: passwordValidation.message } };
      }

      console.log('Attempting sign up for:', sanitizedEmail);

      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            app_name: 'HonestInvoice'
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        securityLogger.logFailedAuth(sanitizedEmail, error.message);
        return { error };
      }

      console.log('Sign up successful for:', data.user?.email);
      sessionManager.updateLastActivity();
      securityLogger.logSecurityEvent('SIGNUP_SUCCESS', { email: sanitizedEmail });
      return { error: null };
    } catch (error: any) {
      console.error('Unexpected sign up error:', error);
      securityLogger.logSecurityEvent('SIGNUP_ERROR', { error: error.message });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Signing out...');
      
      const userId = user?.id;
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        securityLogger.logSecurityEvent('LOGOUT_ERROR', { error: error.message });
      } else {
        console.log('Sign out successful');
        // Clear security-related localStorage
        localStorage.removeItem('last_activity');
        securityLogger.logSecurityEvent('LOGOUT_SUCCESS', { userId });
      }
    } catch (error: any) {
      console.error('Unexpected sign out error:', error);
      securityLogger.logSecurityEvent('LOGOUT_ERROR', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
