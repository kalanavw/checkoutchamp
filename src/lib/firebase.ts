
import { initializeApp } from 'firebase/app';
import { initializeFirestore, CACHE_SIZE_UNLIMITED, persistentLocalCache } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA_ReJ3a7qewp89vsp8-MpN_tfWI8oRUtI",
  authDomain: "stock-champ-2a9df.firebaseapp.com",
  projectId: "stock-champ-2a9df",
  storageBucket: "stock-champ-2a9df.appspot.com",
  messagingSenderId: "274289865490",
  appId: "1:274289865490:web:b160e0705ae509179279cb",
  measurementId: "G-3F0JVEY523"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({cacheSizeBytes: CACHE_SIZE_UNLIMITED})
});

// Initialize Authentication with browserPopupRedirectResolver
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Add Drive API scope to Google provider (for Google Drive integration)
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

// Configure custom parameters for Google provider
googleProvider.setCustomParameters({
  // Force account selection to prevent COOP issues
  prompt: 'select_account'
});

// Define user collection name - centralized for consistency
export const USER_COLLECTION = "users";
export const CUSTOMER_COLLECTION = "customers";
export const PRODUCT_COLLECTION = "products";
export const STOREINFO_COLLECTION = "storeInfo";
export const LOCATIONS_COLLECTION = "locations";
