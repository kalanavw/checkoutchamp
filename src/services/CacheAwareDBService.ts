import {
    getCollectionTimestamps,
    saveCollectionFetchTime,
    saveCollectionUpdateTime,
    shouldFetchCollection
} from "@/utils/collectionUtils.ts";
import {getFromCache, isCacheValid, saveToCache} from "@/utils/cacheUtils.ts";
import {findAll, findById, insertDocument, insertDocuments} from "@/lib/firebase.ts";
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
                saveToCache(collectionData.cacheKey, [...cachedDocuments.filter(doc => doc.id !== id), document]);
            }

            return document;
        } catch (error) {
            console.error(`Error fetching document by ID from ${collectionData.collection}:`, error);
            return null;
        }
    }

    async saveDocument<T>(collectionData: CollectionData<T>): Promise<T | null> {
        try {
            const newUser = await insertDocument(collectionData.collection, collectionData.document);

            saveCollectionUpdateTime(collectionData.collectionKey)

            const cachedDocuments = getFromCache<T[]>(collectionData.cacheKey) || [];
            saveToCache(collectionData.cacheKey, [newUser, ...cachedDocuments]);

            return newUser;
        } catch (error) {
            console.error(`Error saving document in ${collectionData.collectionKey}:`, error);
            throw error;
        }
    }

    async saveDocuments<T>(collectionData: CollectionData<T>,): Promise<T[] | null> {
        try {
            const newDocuments = await insertDocuments(collectionData.collection, collectionData.documents);

            saveCollectionUpdateTime(collectionData.collectionKey);

            const cachedDocuments = getFromCache<T[]>(collectionData.cacheKey) || [];
            saveToCache(collectionData.cacheKey, [...newDocuments, ...cachedDocuments]);

            return newDocuments;
        } catch (error) {
            console.error(`Error saving documents in ${collectionData.collectionKey}:`, error);
            throw error;
        }
    }

}

export const cacheAwareDBService = new CacheAwareDBService()
