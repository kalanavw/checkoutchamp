
import {
    getCollectionTimestamps,
    saveCollectionFetchTime,
    saveCollectionUpdateTime,
    shouldFetchCollection
} from "@/utils/collectionUtils.ts";
import {getFromCache, isCacheValid, saveToCache} from "@/utils/cacheUtils.ts";
import {deleteDocument, findAll, findById, insertDocument, insertDocuments} from "@/lib/firebase.ts";
import {CollectionData} from "@/utils/collectionData.ts";

export class CacheAwareDBService {
    async fetchDocuments<T>(collectionData: CollectionData<T>): Promise<T[]> {
        try {
            const shouldRefresh = shouldFetchCollection(collectionData.collectionKey);
            if (!shouldRefresh && isCacheValid(collectionData.cacheKey)) {
                const cachedDocuments = getFromCache<T[]>(collectionData.cacheKey);
                if (cachedDocuments && cachedDocuments.length > 0) {
                    console.log(`Using cached data for collection: ${collectionData.collectionKey}`);
                    return cachedDocuments;
                }
            }
            const documents = await findAll<T>(collectionData.collection);
            saveToCache(collectionData.cacheKey, documents);
            saveCollectionFetchTime(collectionData.collectionKey);
            return documents;
        } catch (error) {
            console.error(`Error fetching documents for collection: ${collectionData.collection}`, error);
            return [];
        }
    }

    async findById<T extends { id: string }>(collectionData: CollectionData<T>, id: string): Promise<T | null> {
        try {
            const {lastFetchTime, lastUpdateTime} = getCollectionTimestamps(collectionData.collectionKey);
            const cachedDocuments = getFromCache<T[]>(collectionData.cacheKey) || [];
            const cachedDocument = cachedDocuments.find(doc => doc.id === id);

            if (cachedDocument && lastFetchTime > lastUpdateTime) {
                console.log(`Using cached document for ${collectionData.collection} with ID: ${id}`);
                return cachedDocument;
            }

            console.log(`Fetching fresh document for ${collectionData.collection} with ID: ${id}`);
            const document = await findById<T>(collectionData.collection, id);

            if (document) {
                // Update the document in the cache
                const updatedCache = cachedDocuments.filter(doc => doc.id !== id);
                updatedCache.push(document);
                saveToCache(collectionData.cacheKey, updatedCache);
            }

            return document;
        } catch (error) {
            console.error(`Error fetching document by ID from ${collectionData.collection}:`, error);
            return null;
        }
    }

    async saveDocument<T extends { id: string }>(collectionData: CollectionData<T>): Promise<T | null> {
        try {
            const newDocument = await insertDocument(collectionData.collection, collectionData.document);
            
            saveCollectionUpdateTime(collectionData.collectionKey);

            // Update the document in the cache
            const cachedDocuments = getFromCache<T[]>(collectionData.cacheKey) || [];
            const updatedCache = cachedDocuments.filter(doc => doc.id !== newDocument.id);
            updatedCache.push(newDocument);
            saveToCache(collectionData.cacheKey, updatedCache);

            return newDocument;
        } catch (error) {
            console.error(`Error saving document in ${collectionData.collectionKey}:`, error);
            throw error;
        }
    }

    async saveDocuments<T extends { id: string }>(collectionData: CollectionData<T>,): Promise<T[] | null> {
        try {
            const newDocuments = await insertDocuments(collectionData.collection, collectionData.documents);

            saveCollectionUpdateTime(collectionData.collectionKey);

            // Update all documents in the cache
            const cachedDocuments = getFromCache<T[]>(collectionData.cacheKey) || [];
            
            // Remove old versions of these documents from cache
            const documentIds = newDocuments.map(doc => doc.id);
            const filteredCache = cachedDocuments.filter(doc => !documentIds.includes(doc.id));
            
            // Add the new documents
            saveToCache(collectionData.cacheKey, [...filteredCache, ...newDocuments]);

            return newDocuments;
        } catch (error) {
            console.error(`Error saving documents in ${collectionData.collectionKey}:`, error);
            throw error;
        }
    }
    
    async deleteDocument<T extends { id: string }>(collectionData: CollectionData<T>, id: string): Promise<boolean> {
        try {
            await deleteDocument(collectionData.collection, id);
            
            saveCollectionUpdateTime(collectionData.collectionKey);
            
            // Remove the document from the cache
            const cachedDocuments = getFromCache<T[]>(collectionData.cacheKey) || [];
            const updatedCache = cachedDocuments.filter(doc => doc.id !== id);
            saveToCache(collectionData.cacheKey, updatedCache);
            
            return true;
        } catch (error) {
            console.error(`Error deleting document from ${collectionData.collection}:`, error);
            return false;
        }
    }
}

export const cacheAwareDBService = new CacheAwareDBService();
