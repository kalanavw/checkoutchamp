
import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistence
export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export default db;
