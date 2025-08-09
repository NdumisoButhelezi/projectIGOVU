// API configuration utility
export const getApiBaseUrl = (): string => {
  // First, try to get from environment variable
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (envUrl) {
    console.log('Using API URL from environment:', envUrl);
    return envUrl;
  }
  
  // Fallback: construct from current origin
  if (typeof window !== 'undefined') {
    const fallbackUrl = `${window.location.origin}/api`;
    console.log('Using fallback API URL:', fallbackUrl);
    return fallbackUrl;
  }
  
  // Server-side fallback
  console.log('Using server-side fallback API URL: /api');
  return '/api';
};

// API endpoints
export const API_ENDPOINTS = {
  YOCO_CHECKOUT: '/yoco-checkout',
  COURIERGUY_QUOTE: '/courierguy-quote',
  SYNC_STOCK: '/sync-stock',
  GEOCODE: '/geocode',
  HELLO: '/hello',
} as const;

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
};

// Debug function to log API configuration
export const debugApiConfig = (): void => {
  console.log('=== API Configuration Debug ===');
  console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('Resolved API Base URL:', getApiBaseUrl());
  console.log('Sample endpoints:');
  Object.entries(API_ENDPOINTS).forEach(([name, endpoint]) => {
    console.log(`  ${name}: ${buildApiUrl(endpoint)}`);
  });
  console.log('==============================');
};
