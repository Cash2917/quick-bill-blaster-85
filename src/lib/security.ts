/**
 * Security utilities for HonestInvoice
 * Implements industry-standard security practices
 */

export const SecurityConfig = {
  // Rate limiting configuration
  RATE_LIMITS: {
    API_CALLS_PER_MINUTE: 60,
    AUTH_ATTEMPTS_PER_HOUR: 5,
    INVOICE_CREATION_PER_HOUR: 20,
    PAYMENT_ATTEMPTS_PER_HOUR: 3
  },
  
  // Session security
  SESSION: {
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
    REFRESH_THRESHOLD: 60 * 60 * 1000, // 1 hour before expiry
    IDLE_TIMEOUT: 30 * 60 * 1000 // 30 minutes
  },
  
  // Input validation
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    INVOICE_NUMBER_REGEX: /^[A-Z0-9-]+$/,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_COMPANY_NAME_LENGTH: 100,
    MIN_PASSWORD_LENGTH: 8
  }
} as const;

/**
 * Rate limiter using localStorage for client-side tracking
 */
class RateLimiter {
  private getKey(action: string): string {
    return `rate_limit_${action}`;
  }

  private cleanupExpiredEntries(entries: Array<{ timestamp: number; count: number }>): Array<{ timestamp: number; count: number }> {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    return entries.filter(entry => now - entry.timestamp < oneHour);
  }

  public isAllowed(action: string, limit: number, windowMs: number = 60 * 60 * 1000): boolean {
    try {
      const key = this.getKey(action);
      const stored = localStorage.getItem(key);
      const now = Date.now();
      
      let entries: Array<{ timestamp: number; count: number }> = stored ? JSON.parse(stored) : [];
      entries = this.cleanupExpiredEntries(entries);
      
      const totalCount = entries.reduce((sum, entry) => sum + entry.count, 0);
      
      if (totalCount >= limit) {
        return false;
      }
      
      // Add current attempt
      entries.push({ timestamp: now, count: 1 });
      localStorage.setItem(key, JSON.stringify(entries));
      return true;
    } catch (error) {
      console.error('Rate limiter error:', error);
      return true; // Fail open for better UX
    }
  }

  public getRemainingAttempts(action: string, limit: number): number {
    try {
      const key = this.getKey(action);
      const stored = localStorage.getItem(key);
      
      if (!stored) return limit;
      
      let entries: Array<{ timestamp: number; count: number }> = JSON.parse(stored);
      entries = this.cleanupExpiredEntries(entries);
      
      const totalCount = entries.reduce((sum, entry) => sum + entry.count, 0);
      return Math.max(0, limit - totalCount);
    } catch (error) {
      console.error('Rate limiter error:', error);
      return limit;
    }
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Input sanitization and validation
 */
export const sanitizeInput = {
  email: (email: string): string => {
    return email.trim().toLowerCase();
  },
  
  text: (text: string): string => {
    return text.trim().replace(/[<>]/g, '');
  },
  
  invoiceNumber: (number: string): string => {
    return number.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  },
  
  amount: (amount: string | number): number => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? 0 : Math.max(0, Math.round(num * 100) / 100);
  }
};

/**
 * Validate inputs
 */
export const validateInput = {
  email: (email: string): boolean => {
    return SecurityConfig.VALIDATION.EMAIL_REGEX.test(email);
  },
  
  password: (password: string): { valid: boolean; message?: string } => {
    if (password.length < SecurityConfig.VALIDATION.MIN_PASSWORD_LENGTH) {
      return { valid: false, message: `Password must be at least ${SecurityConfig.VALIDATION.MIN_PASSWORD_LENGTH} characters` };
    }
    // Simplified validation for better UX
    return { valid: true };
  },
  
  invoiceData: (data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data.invoice_number || !SecurityConfig.VALIDATION.INVOICE_NUMBER_REGEX.test(data.invoice_number)) {
      errors.push('Invalid invoice number format');
    }
    
    if (!data.client_name || data.client_name.length > SecurityConfig.VALIDATION.MAX_COMPANY_NAME_LENGTH) {
      errors.push('Invalid client name');
    }
    
    if (data.amount && (isNaN(data.amount) || data.amount < 0)) {
      errors.push('Invalid amount');
    }
    
    return { valid: errors.length === 0, errors };
  }
};

/**
 * Secure session management
 */
export const sessionManager = {
  isSessionExpired: (lastActivity: number): boolean => {
    return Date.now() - lastActivity > SecurityConfig.SESSION.IDLE_TIMEOUT;
  },
  
  shouldRefreshToken: (expiresAt: number): boolean => {
    return Date.now() > expiresAt - SecurityConfig.SESSION.REFRESH_THRESHOLD;
  },
  
  updateLastActivity: (): void => {
    localStorage.setItem('last_activity', Date.now().toString());
  },
  
  getLastActivity: (): number => {
    const stored = localStorage.getItem('last_activity');
    return stored ? parseInt(stored) : Date.now();
  }
};

/**
 * Error logging for security events
 */
export const securityLogger = {
  logSecurityEvent: (event: string, details?: any): void => {
    console.warn(`[SECURITY] ${event}`, details);
    // In production, send to monitoring service
  },
  
  logFailedAuth: (email: string, reason: string): void => {
    securityLogger.logSecurityEvent('AUTH_FAILED', { email, reason, timestamp: new Date().toISOString() });
  },
  
  logRateLimitHit: (action: string, identifier?: string): void => {
    securityLogger.logSecurityEvent('RATE_LIMIT_HIT', { action, identifier, timestamp: new Date().toISOString() });
  }
};