
import { initializeApp } from 'firebase/app';
import { initializeFirestore, CACHE_SIZE_UNLIMITED, persistentLocalCache } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, browserPopupRedirectResolver } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA_ReJ3a7qewp89vsp8-MpN_tfWI8oRUtI",
  authDomain: "stock-champ-2a9df.firebaseapp.com",
  projectId: "stock-champ-2a9df",
  storageBucket: "stock-champ-2a9df.firebasestorage.app",
  messagingSenderId: "274289865490",
  appId: "1:274289865490:web:b160e0705ae509179279cb",
  measurementId: "G-3F0JVEY523"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Initialize Firestore with persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({cacheSizeBytes: CACHE_SIZE_UNLIMITED})
});

// Initialize Authentication with browserPopupRedirectResolver
// This helps fix the Cross-Origin-Opener-Policy issue
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure custom parameters for Google provider
googleProvider.setCustomParameters({
  // Using popup for better compatibility with COOP policy
  prompt: 'select_account'
});

// Initialize Storage
export const storage = getStorage(app);
