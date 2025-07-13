/**
 * Production configuration for HonestInvoice
 * Security, performance, and deployment settings
 */

export const ProductionConfig = {
  // Environment detection
  IS_PRODUCTION: window.location.hostname === 'honestinvoice.com',
  
  // Domain configuration
  DOMAINS: {
    PRODUCTION: 'https://honestinvoice.com',
    STAGING: 'https://staging.honestinvoice.com',
    DEVELOPMENT: 'http://localhost:5173'
  },
  
  // Security headers
  SECURITY_HEADERS: {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co https://api.stripe.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com"
    ].join('; '),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  },
  
  // Performance optimization
  PERFORMANCE: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    QUERY_CACHE_TIME: 5 * 60 * 1000, // 5 minutes
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    REQUEST_TIMEOUT: 10000, // 10 seconds
    MAX_RETRIES: 3
  },
  
  // Feature flags
  FEATURES: {
    ANALYTICS_ENABLED: true,
    ERROR_REPORTING: true,
    PERFORMANCE_MONITORING: true,
    A11Y_COMPLIANCE: true,
    GDPR_COMPLIANCE: true
  },
  
  // Monitoring and logging
  MONITORING: {
    ERROR_THRESHOLD: 10, // errors per hour
    PERFORMANCE_BUDGET: 3000, // 3 seconds
    UPTIME_THRESHOLD: 99.9, // percentage
    ALERT_EMAIL: 'alerts@honestinvoice.com'
  }
} as const;

/**
 * Get current environment configuration
 */
export const getCurrentEnvironment = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'honestinvoice.com') {
    return {
      name: 'production',
      baseUrl: ProductionConfig.DOMAINS.PRODUCTION,
      isProduction: true
    };
  }
  
  if (hostname.includes('staging')) {
    return {
      name: 'staging',
      baseUrl: ProductionConfig.DOMAINS.STAGING,
      isProduction: false
    };
  }
  
  return {
    name: 'development',
    baseUrl: ProductionConfig.DOMAINS.DEVELOPMENT,
    isProduction: false
  };
};

/**
 * Environment-specific Stripe configuration
 */
export const getStripeConfig = () => {
  const env = getCurrentEnvironment();
  
  return {
    publishableKey: env.isProduction 
      ? 'pk_live_...' // Replace with actual live key
      : 'pk_test_51RSllgRD1hxs4eDXZ25BsePqQM7uHr4wzBjjkYwr9cp1SujpxPdMeKEyHNtRJCaEzOrkP2aD3wBQdedmeXFsxQTX00MVR18NHr',
    
    priceIds: env.isProduction ? {
      pro: 'price_live_pro_monthly', // Replace with actual live price IDs
      business: 'price_live_business_monthly'
    } : {
      pro: 'price_test_pro_monthly', // Replace with actual test price IDs  
      business: 'price_test_business_monthly'
    }
  };
};