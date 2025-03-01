
import { initializeApp } from 'firebase/app';
import { initializeFirestore, CACHE_SIZE_UNLIMITED, persistentLocalCache } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: 'a-pos-10203',
  appId: '1:1071999236972:web:aeec4384d2b22f9dd31149',
  storageBucket: 'a-pos-10203.appspot.com',
  apiKey: 'AIzaSyCSOcP-2WfphlWaSsGk8FWrZxzImFG3wFk',
  authDomain: 'a-pos-10203.firebaseapp.com',
  messagingSenderId: '1071999236972',
  measurementId: 'G-DH2RM4G560',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({cacheSizeBytes: CACHE_SIZE_UNLIMITED})
});

// Initialize Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Storage
export const storage = getStorage(app);
