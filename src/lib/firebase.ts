import {initializeApp} from 'firebase/app';
import {
    CACHE_SIZE_UNLIMITED,
    collection,
    CollectionReference,
    deleteDoc,
    doc,
    DocumentData,
    DocumentReference,
    getDoc,
    getDocs,
    initializeFirestore,
    limit,
    persistentLocalCache,
    query,
    setDoc,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import {getAuth, GoogleAuthProvider} from 'firebase/auth';
import {getStorage} from 'firebase/storage';
import {generateCustomUUID} from "@/utils/Util.ts";


const firebaseConfig = {
    apiKey: "AIzaSyC6whbU2S11QdDZpY5yDWbwaYh-4aeINaI",
    authDomain: "payboss-e9f9b.firebaseapp.com",
    projectId: "payboss-e9f9b",
    storageBucket: "payboss-e9f9b.firebasestorage.app",
    messagingSenderId: "1093419350977",
    appId: "1:1093419350977:web:5460ba5de1254b7e058d40",
    measurementId: "G-2MV305KJ2L"
};


// Initialize Firebase

const app = initializeApp(firebaseConfig);
// Initialize Firestore with persistence

export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({cacheSizeBytes: CACHE_SIZE_UNLIMITED})
});
// Initialize Authentication with browserPopupRedirectResolver

export const auth = getAuth(app);
export const storage = getStorage(app);
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
export const WAREHOUSE_COLLECTION = "warehouses";
export const STORE_COLLECTION = "store"
export const INVOICE_COLLECTION = "invoices"

// Get collection reference
export function getCollection(collectionName: string): CollectionReference<DocumentData> {
    return collection(db, collectionName);
}

// Find all documents in a collection
export async function findAll<T>(collectionName: string): Promise<T[]> {
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as T[];
    } catch (error) {
        console.error(`Error finding all documents in ${collectionName}:`, error);
        return [] as T[];
    }
}

// Find documents by filter
export async function findByFilter<T>(
    collectionName: string,
    filters: { field: string, operator: string, value: any }[],
    limitCount: number = 0
): Promise<T[]> {
    try {

        const collectionRef = collection(db, collectionName);

        // Build query with filters
        let queryRef = query(collectionRef);

        filters.forEach(filter => {
            queryRef = query(queryRef, where(filter.field, filter.operator as any, filter.value));
        });

        // Add limit if provided
        if (limitCount > 0) {
            queryRef = query(queryRef, limit(limitCount));
        }

        const querySnapshot = await getDocs(queryRef);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as T[];
    } catch (error) {
        console.error(`Error finding documents by filter in ${collectionName}:`, error);
        return [] as T[];
    }
}

// Find document by ID
export async function findById<T>(collectionName: string, id: string): Promise<T | null> {
    try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as T;
        }

        return null;
    } catch (error) {
        console.error(`Error finding document by ID in ${collectionName}:`, error);
        return null;
    }
}

// Insert or Update a document
export async function insertDocument<T extends { id?: string }>(collectionName: string, document: T): Promise<T | null> {
    try {
        let user = "Unknown";
        const { id, ...data } = document;
        let docRef: DocumentReference;
        const authUser = localStorage.getItem("user");
        if (authUser) {
            const parsedUser = JSON.parse(authUser);
            user = parsedUser.displayName;
        }
        if (id && id !== "G") {
            // Update existing document
            docRef = doc(db, collectionName, id);
            await updateDoc(docRef, {
                ...data,
                modifiedDate: new Date(),
                modifiedBy: user,
            });
        } else {
            // Create new document
            const docId = generateCustomUUID();
            const collectionRef = collection(db, collectionName);
            docRef = doc(collectionRef, docId);
            await setDoc(docRef, {
                id: docId,
                ...data,
                modifiedDate: new Date(),
                modifiedBy: user,
                createdAt: new Date(),
                createdBy: user
            });
        }

        // Return document with the assigned id
        return {
            id: docRef.id,
            ...data
        } as T;
    } catch (error) {
        console.error(`Error saving document in ${collectionName}:`, error);
        throw error;
    }
}

export async function insertDocuments<T extends { id?: string }>(collectionName: string, documents: T[]): Promise<T[]> {
    try {
        let user = "Unknown";
        const authUser = localStorage.getItem("user");
        if (authUser) {
            const parsedUser = JSON.parse(authUser);
            user = parsedUser.displayName;
        }

        const batch = writeBatch(db);

        documents.forEach((document) => {
            const {id, ...data} = document;
            let docRef: DocumentReference;

            if (id && id !== "G") {
                // Update existing document
                docRef = doc(db, collectionName, id);
                batch.update(docRef, {
                    ...data,
                    modifiedDate: new Date(),
                    modifiedBy: user,
                });
            } else {
                // Create new document
                const docId = generateCustomUUID();
                const collectionRef = collection(db, collectionName);
                docRef = doc(collection(db, collectionName));
                const newDoc = {
                    id: docId,
                    ...data,
                    modifiedDate: new Date(),
                    modifiedBy: user,
                    createdAt: new Date(),
                    createdBy: user,
                };
                batch.set(docRef, newDoc);
            }
        });

        await batch.commit();
        return [];
    } catch (error) {
        console.error(`Error saving documents in ${collectionName}:`, error);
        throw error;
    }
}

// Delete a document
export async function deleteOne(collectionName: string, id: string): Promise<boolean> {
    try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);

        return true;
    } catch (error) {
        console.error(`Error deleting document from ${collectionName}:`, error);
        return false;
    }
}

// Helper function to create search filter array for Firebase
export function createSearchFilters(field: string, searchTerm: string, searchType: 'startsWith' | 'contains' = 'contains'): {
    field: string,
    operator: string,
    value: any
}[] {
    // For Firebase, we can't do regex matches directly like MongoDB
    // We need to use range queries for 'startsWith' and multiple filters for 'contains'

    if (searchType === 'startsWith') {
        return [{
            field,
            operator: '>=',
            value: searchTerm
        }, {
            field,
            operator: '<=',
            value: searchTerm + '\uf8ff'
        }];
    }

    // For contains, we would need a more complex solution in production
    // Firebase doesn't directly support 'contains' queries
    // In a real app, you'd need to use Firebase's full-text search or a third-party service
    // For simplicity, we'll use 'startsWith' for the demo
    return [{
        field,
        operator: '>=',
        value: searchTerm
    }, {
        field,
        operator: '<=',
        value: searchTerm + '\uf8ff'
    }];
}