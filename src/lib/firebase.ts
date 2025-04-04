
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, limit, doc, getDoc, addDoc, updateDoc, deleteDoc, orderBy, startAfter } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC6whbU2S11QdDZpY5yDWbwaYh-4aeINaI",
  authDomain: "payboss-e9f9b.firebaseapp.com",
  projectId: "payboss-e9f9b",
  storageBucket: "payboss-e9f9b.firebasestorage.app",
  messagingSenderId: "1093419350977",
  appId: "1:1093419350977:web:5460ba5de1254b7e058d40",
  measurementId: "G-2MV305KJ2L"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Collections
const WAREHOUSE_COLLECTION = "warehouses";
const STORE_COLLECTION = "stores";
const STOREINFO_COLLECTION = "storeinfo"; // Adding this missing export
const PRODUCT_COLLECTION = "products";
const CUSTOMER_COLLECTION = "customers";
const INVOICE_COLLECTION = "invoices";
const USER_COLLECTION = "users";

export {
  db,
  auth,
  storage,
  googleProvider,
  WAREHOUSE_COLLECTION,
  STORE_COLLECTION,
  STOREINFO_COLLECTION,
  PRODUCT_COLLECTION,
  CUSTOMER_COLLECTION,
  INVOICE_COLLECTION,
  USER_COLLECTION,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  ref,
  uploadBytes,
  getDownloadURL,
  getDocs,
  collection,
  query,
  where,
  limit,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  orderBy,
  startAfter
};

// Add this function to handle document deletion
export const deleteDocument = async (collectionName: string, documentId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to fetch all documents from a collection
export const findAll = async <T>(collectionName: string): Promise<T[]> => {
  try {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  } catch (error) {
    console.error(`Error fetching documents from ${collectionName}:`, error);
    throw error;
  }
};

// Function to find documents by a filter
export const findByFilter = async <T>(collectionName: string, field: string, operator: any, value: any): Promise<T[]> => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  } catch (error) {
    console.error(`Error fetching documents from ${collectionName} with filter:`, error);
    throw error;
  }
};

// Function to find a document by ID
export const findById = async <T>(collectionName: string, documentId: string): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as T;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error(`Error fetching document from ${collectionName} with ID ${documentId}:`, error);
    throw error;
  }
};

// Function to insert a new document
export const insertDocument = async <T extends Record<string, any>>(collectionName: string, data: T): Promise<T & { id: string }> => {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, data);

    // After adding the document, fetch it to return the complete object
    const newDocSnap = await getDoc(doc(db, collectionName, docRef.id));

    if (newDocSnap.exists()) {
      return {
        id: newDocSnap.id,
        ...newDocSnap.data()
      } as T & { id: string };
    } else {
      console.log("No such document!");
      throw new Error("Document not found after creation");
    }
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

// Function to insert multiple documents
export const insertDocuments = async <T extends Record<string, any>>(collectionName: string, documents: T[]): Promise<(T & { id: string })[]> => {
  try {
    const collectionRef = collection(db, collectionName);
    const newDocs: (T & { id: string })[] = [];

    for (const data of documents) {
      const docRef = await addDoc(collectionRef, data);

      // After adding the document, fetch it to return the complete object
      const newDocSnap = await getDoc(doc(db, collectionName, docRef.id));

      if (newDocSnap.exists()) {
        newDocs.push({
          id: newDocSnap.id,
          ...newDocSnap.data()
        } as T & { id: string });
      } else {
        console.log("No such document!");
      }
    }

    return newDocs;
  } catch (error) {
    console.error(`Error adding documents to ${collectionName}:`, error);
    throw error;
  }
};

// Function to update an existing document
export const updateDocument = async <T extends Record<string, any>>(collectionName: string, documentId: string, data: Partial<T>): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, data as Record<string, any>);
  } catch (error) {
    console.error(`Error updating document in ${collectionName} with ID ${documentId}:`, error);
    throw error;
  }
};

// Function to create search filters
export const createSearchFilters = (searchQuery: string) => {
  const filters: any[] = [];
  if (searchQuery) {
    filters.push(where("name", ">=", searchQuery));
    filters.push(where("name", "<=", searchQuery + "\uf8ff"));
  }
  return filters;
};
