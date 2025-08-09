// Universal module compatible with CommonJS and ES Modules
import * as adminPkg from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Handle ES modules and CommonJS interop
const admin = adminPkg.default ?? adminPkg;

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

// Export as both CommonJS and ES Module
export default admin;
export { admin };
// Legacy CommonJS support
module.exports = admin;
