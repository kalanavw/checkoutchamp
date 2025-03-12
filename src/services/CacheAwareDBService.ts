import {
    getCollectionTimestamps,
    saveCollectionFetchTime,
    saveCollectionUpdateTime,
    shouldFetchCollection
} from "@/utils/collectionUtils.ts";
import {getFromCache, isCacheValid, saveToCache} from "@/utils/cacheUtils.ts";
import {findAll, findById, insertDocument} from "@/lib/firebase.ts";

export class CacheAwareDBService {
    async fetchDocuments<T>(collectionName: string, collectionKey: string, cacheKey: string): Promise<T[]> {
        try {
            const shouldRefresh = shouldFetchCollection(collectionKey);
            if (!shouldRefresh && isCacheValid(cacheKey)) {
                const cachedDocuments = getFromCache<T[]>(cacheKey);
                if (cachedDocuments.length > 0) {
                    console.log(`Using cached data for collection: ${collectionKey}`);
                    return cachedDocuments;
                }
            }
            const documents = await findAll<T>(collectionName);
            saveToCache(cacheKey, documents);
            saveCollectionFetchTime(collectionKey);
            return documents;
        } catch (error) {
            console.error(`Error fetching documents for collection: ${collectionName}`, error);
            return [];
        }
    }

    async findById<T>(collectionName: string, collectionKey: string, cacheKey: string, id: string): Promise<T | null> {
        try {
            const {lastFetchTime, lastUpdateTime} = getCollectionTimestamps(collectionKey);
            const cachedDocuments = getFromCache<T[]>(cacheKey) || [];
            const cachedDocument = cachedDocuments.find(doc => doc.id === id);

            if (cachedDocument && lastFetchTime > lastUpdateTime) {
                console.log(`Using cached document for ${collectionName} with ID: ${id}`);
                return cachedDocument;
            }

            console.log(`Fetching fresh document for ${collectionName} with ID: ${id}`);
            const document = await findById<T>(collectionName, id);

            if (document) {
                saveToCache(cacheKey, [...cachedDocuments.filter(doc => doc.id !== id), document]);
            }

            return document;
        } catch (error) {
            console.error(`Error fetching document by ID from ${collectionName}:`, error);
            return null;
        }
    }

    async saveDocument<T>(collectionName: string, collectionKey: string, cacheKey: string, document: T): Promise<T | null> {
        try {
            const newUser = await insertDocument(collectionName, document);

            saveCollectionUpdateTime(collectionKey)

            // Update cache
            const cachedDocuments = getFromCache<T[]>(cacheKey) || [];
            saveToCache(cacheKey, [newUser, ...cachedDocuments]);

            return newUser;
        } catch (error) {
            console.error(`Error saving document in ${collectionKey}:`, error);
            throw error;
        }
    }


}

export const cacheAwareDBService = new CacheAwareDBService()