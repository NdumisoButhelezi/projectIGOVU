import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAN_L-zfDVCH_jvYaqFI8gSPPVChzW3OUg",
  authDomain: "igovu-e05f4.firebaseapp.com",
  projectId: "igovu-e05f4",
  storageBucket: "igovu-e05f4.appspot.com",
  messagingSenderId: "480096199930",
  appId: "1:480096199930:web:67c5ecbaa967b6249dd543",
  measurementId: "G-CYDRC8D70S"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Configure storage with max operation retry time
const maxRetryTime = 60000; // 60 seconds
const maxUploadRetryTime = 120000; // 2 minutes for uploads

console.log('Firebase initialized:', {
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  storageInitialized: !!storage,
  storageApp: storage.app.name,
  maxRetryTime,
  maxUploadRetryTime
});

// Only initialize analytics in the browser (not SSR)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : undefined;