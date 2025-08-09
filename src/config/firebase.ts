import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAN_L-zfDVCH_jvYaqFI8gSPPVChzW3OUg",
  authDomain: "igovu-e05f4.firebaseapp.com",
  projectId: "igovu-e05f4",
  storageBucket: "igovu-e05f4.appspot.com", // fixed typo here
  messagingSenderId: "480096199930",
  appId: "1:480096199930:web:67c5ecbaa967b6249dd543",
  measurementId: "G-CYDRC8D70S"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Only initialize analytics in the browser (not SSR)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : undefined;