// Environment validation for production deployment
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_YOCO_PUBLIC_KEY',
  'VITE_API_BASE_URL'
];

const serverEnvVars = [
  'YOCO_SECRET_KEY',
  'SHIPLOGIC_API_KEY',
  'OSM_API_KEY',
  'COURIERGUY_API_KEY'
];

export function validateClientEnv() {
  const missing = requiredEnvVars.filter(key => !import.meta.env[key]);
  if (missing.length > 0) {
    console.warn('Missing client environment variables:', missing);
  }
  return missing.length === 0;
}

export function validateServerEnv() {
  if (typeof process === 'undefined') return true; // Client-side
  
  const missing = serverEnvVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.warn('Missing server environment variables:', missing);
  }
  return missing.length === 0;
}

// Auto-validate on import
if (typeof window !== 'undefined') {
  validateClientEnv();
}
