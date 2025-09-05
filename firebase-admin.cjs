// CommonJS version of Firebase Admin for API routes
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  let credential;
  
  // Check if we have individual Firebase service account variables (preferred for Vercel)
  if (process.env.FIREBASE_TYPE && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    console.log('Using individual Firebase environment variables');
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle newlines
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || 'googleapis.com'
    };
    credential = admin.credential.cert(serviceAccount);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    // Use JSON from environment variable (fallback)
    console.log('Using GOOGLE_APPLICATION_CREDENTIALS_JSON');
    const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    credential = admin.credential.cert(serviceAccount);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use file path (for local development)
    console.log('Using GOOGLE_APPLICATION_CREDENTIALS file path');
    credential = admin.credential.applicationDefault();
  } else {
    throw new Error('Firebase Admin credentials not configured. Please set individual Firebase environment variables or GOOGLE_APPLICATION_CREDENTIALS_JSON');
  }

  admin.initializeApp({
    credential: credential,
  });
  
  console.log('Firebase Admin initialized successfully');
}

module.exports = admin;
