/**
 * Custom Authentication Service
 * Handles Google Sign-In with Supabase database integration
 */

import { supabase } from '@/integrations/supabase/client';
import { decodeGoogleToken, type GoogleUser } from './google-auth';
import { securityLogger, sessionManager } from './security';

export interface CustomUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  google_id: string;
  created_at: string;
  updated_at: string;
}

export interface CustomSession {
  user: CustomUser;
  access_token: string;
  expires_at: number;
}

class CustomAuthService {
  private session: CustomSession | null = null;
  private listeners: ((session: CustomSession | null) => void)[] = [];

  constructor() {
    this.loadSessionFromStorage();
  }

  /**
   * Get current session
   */
  getSession(): CustomSession | null {
    return this.session;
  }

  /**
   * Get current user
   */
  getUser(): CustomUser | null {
    return this.session?.user || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!this.session) return false;
    
    // Check if session is expired
    if (Date.now() > this.session.expires_at) {
      this.signOut();
      return false;
    }
    
    return true;
  }

  /**
   * Sign in with Google credential
   */
  async signInWithGoogle(credential: string): Promise<{ user: CustomUser | null; error: Error | null }> {
    try {
      securityLogger.logSecurityEvent('GOOGLE_AUTH_ATTEMPT');
      
      // Decode Google token
      const googleUser = decodeGoogleToken(credential);
      if (!googleUser) {
        throw new Error('Invalid Google credential');
      }

      // Verify token with backend
      const { data: verificationData, error: verificationError } = await supabase.functions.invoke('verify-google-token', {
        body: { credential, googleUser }
      });

      if (verificationError) {
        throw new Error(`Token verification failed: ${verificationError.message}`);
      }

      // Create or update user in database
      const { data: userData, error: userError } = await this.createOrUpdateUser(googleUser);
      if (userError) {
        throw new Error(`User creation failed: ${userError.message}`);
      }

      // Create session
      const session: CustomSession = {
        user: userData,
        access_token: this.generateAccessToken(userData),
        expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      };

      this.setSession(session);
      sessionManager.updateLastActivity();
      securityLogger.logSecurityEvent('GOOGLE_AUTH_SUCCESS', { userId: userData.id });

      return { user: userData, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      securityLogger.logSecurityEvent('GOOGLE_AUTH_ERROR', { error: errorMessage });
      return { user: null, error: new Error(errorMessage) };
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      const userId = this.session?.user?.id;
      this.setSession(null);
      this.clearSessionFromStorage();
      sessionManager.updateLastActivity();
      securityLogger.logSecurityEvent('LOGOUT_SUCCESS', { userId });
    } catch (error) {
      securityLogger.logSecurityEvent('LOGOUT_ERROR', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (session: CustomSession | null) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Create or update user in database
   */
  private async createOrUpdateUser(googleUser: GoogleUser): Promise<{ data: CustomUser; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          google_id: googleUser.id,
          email: googleUser.email,
          full_name: googleUser.name,
          avatar_url: googleUser.picture,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'google_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        data: {
          id: data.id,
          email: data.email,
          name: data.full_name || googleUser.name,
          picture: data.avatar_url,
          google_id: data.google_id,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
        error: null
      };
    } catch (error) {
      return {
        data: null as any,
        error: error instanceof Error ? error : new Error('Database error')
      };
    }
  }

  /**
   * Generate access token for session
   */
  private generateAccessToken(user: CustomUser): string {
    // In production, use a proper JWT library with secret key
    const payload = {
      sub: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    };
    
    // Simple base64 encoding for demo - use proper JWT in production
    return btoa(JSON.stringify(payload));
  }

  /**
   * Set session and notify listeners
   */
  private setSession(session: CustomSession | null): void {
    this.session = session;
    this.saveSessionToStorage();
    this.notifyListeners();
  }

  /**
   * Save session to localStorage
   */
  private saveSessionToStorage(): void {
    if (this.session) {
      localStorage.setItem('custom_auth_session', JSON.stringify(this.session));
    } else {
      localStorage.removeItem('custom_auth_session');
    }
  }

  /**
   * Load session from localStorage
   */
  private loadSessionFromStorage(): void {
    try {
      const stored = localStorage.getItem('custom_auth_session');
      if (stored) {
        const session = JSON.parse(stored) as CustomSession;
        
        // Check if session is still valid
        if (Date.now() < session.expires_at) {
          this.session = session;
        } else {
          this.clearSessionFromStorage();
        }
      }
    } catch (error) {
      console.error('Error loading session from storage:', error);
      this.clearSessionFromStorage();
    }
  }

  /**
   * Clear session from localStorage
   */
  private clearSessionFromStorage(): void {
    localStorage.removeItem('custom_auth_session');
  }

  /**
   * Notify all listeners of auth state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.session);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }
}

export const customAuth = new CustomAuthService();