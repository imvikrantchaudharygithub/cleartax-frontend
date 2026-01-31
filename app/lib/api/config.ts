/**
 * API Configuration
 * Update BASE_URL based on your backend deployment
 */

export const API_CONFIG = {
  // Base URL - Use environment variable for Vercel deployment
  // If NEXT_PUBLIC_API_URL is not set, defaults to production URL
  // To use localhost: Set NEXT_PUBLIC_API_URL=http://localhost:4000/api in .env.local
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  // BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://cleartax-backend.vercel.app/api',

  // API Version (if using versioning)
  VERSION: 'v1',
  
  // Timeout in milliseconds
  TIMEOUT: 30000,
  
  // Retry configuration
  RETRY: {
    retries: 3,
    retryDelay: 1000,
  },
};

/**
 * Get full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

