import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, limit, doc, getDoc, addDoc, updateDoc, deleteDoc, orderBy, startAfter } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Collections
const WAREHOUSE_COLLECTION = "warehouses";
const STORE_COLLECTION = "stores";
const PRODUCT_COLLECTION = "products";
const CUSTOMER_COLLECTION = "customers";
const INVOICE_COLLECTION = "invoices";
const USERS_COLLECTION = "users";

export {
  db,
  auth,
  storage,
  WAREHOUSE_COLLECTION,
  STORE_COLLECTION,
  PRODUCT_COLLECTION,
  CUSTOMER_COLLECTION,
  INVOICE_COLLECTION,
  USERS_COLLECTION,
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
export const insertDocument = async <T>(collectionName: string, data: T): Promise<T> => {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, data);

    // After adding the document, fetch it to return the complete object
    const newDocSnap = await getDoc(doc(db, collectionName, docRef.id));

    if (newDocSnap.exists()) {
      return {
        id: newDocSnap.id,
        ...newDocSnap.data()
      } as T;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

// Function to insert multiple documents
export const insertDocuments = async <T>(collectionName: string, documents: T[]): Promise<T[]> => {
  try {
    const collectionRef = collection(db, collectionName);
    const newDocs: T[] = [];

    for (const data of documents) {
      const docRef = await addDoc(collectionRef, data);

      // After adding the document, fetch it to return the complete object
      const newDocSnap = await getDoc(doc(db, collectionName, docRef.id));

      if (newDocSnap.exists()) {
        newDocs.push({
          id: newDocSnap.id,
          ...newDocSnap.data()
        } as T);
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
export const updateDocument = async <T>(collectionName: string, documentId: string, data: T): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, data);
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
