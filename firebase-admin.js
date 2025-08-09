const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  let credential;
  
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    // Use JSON from environment variable (for Vercel deployment)
    const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    credential = admin.credential.cert(serviceAccount);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use file path (for local development)
    credential = admin.credential.applicationDefault();
  } else {
    throw new Error('Firebase Admin credentials not configured');
  }

  admin.initializeApp({
    credential: credential,
  });
}

module.exports = admin;
