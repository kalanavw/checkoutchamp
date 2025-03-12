import {toast} from 'sonner';
import {COLLECTION_KEYS, markCollectionUpdated} from '@/utils/collectionUtils';
import {CACHE_KEYS, getFromCache, isCacheValid, saveToCache} from '@/utils/cacheUtils';
import {v4 as uuidv4} from 'uuid';
import {findAll, saveDocument} from '@/lib/firebase';
import {Store} from "@/types/store.ts";

export class StoreService {
    private collectionName: string = 'stores';

    // Get all store items
    async getStoreItems(): Promise<Store[]> {
        try {
            // Check if we have valid cached data
            if (isCacheValid(CACHE_KEYS.STORE_CACHE_KEY)) {
                const cachedData = getFromCache<Store[]>(CACHE_KEYS.STORE_CACHE_KEY);
                if (cachedData && cachedData.length > 0) {
                    console.log('Using cached store data');
                    return cachedData;
                }
            }

            // If no valid cache, fetch from Firebase
            console.log('Fetching store data from Firebase');
            let storeItems: Store[] = [];

            try {
                storeItems = await findAll<Store>(this.collectionName);
            } catch (error) {
                console.error("Error querying Firebase:", error);
            }

            // Cache the fetched data
            saveToCache(CACHE_KEYS.STORE_CACHE_KEY, storeItems);
            return storeItems;
        } catch (error) {
            console.error("Error getting store items:", error);
            toast.error("Failed to fetch store items. Using mock data.");
        }
    }

    // Search store items with enhanced search to include all fields
    searchStoreItems(term: string, items: Store[]): Store[] {
        if (!term.trim()) return items;

        const searchTerm = term.toLowerCase();
        return items.filter(item =>
            // Product fields
            item.product.name.toLowerCase().includes(searchTerm) ||
            item.product.category.toLowerCase().includes(searchTerm) ||
            item.product.subcategory.toLowerCase().includes(searchTerm) ||
            (item.product.description && item.product.description.toLowerCase().includes(searchTerm)) ||
            (item.product.productCode && item.product.productCode.toLowerCase().includes(searchTerm)) ||
            (item.product.keywords && item.product.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))) ||

            // Location fields
            item.location.name.toLowerCase().includes(searchTerm) ||
            item.location.code.toLowerCase().includes(searchTerm) ||
            (item.location.description && item.location.description.toLowerCase().includes(searchTerm)) ||

            // Store specific fields
            item.grnNumber?.toLowerCase().includes(searchTerm) ||
            item.product.productCode.toLowerCase().includes(searchTerm) ||
            item.product.barcode?.toLowerCase().includes(searchTerm) ||

            // Price related search (convert to string for searching)
            item.costPrice.toString().includes(searchTerm) ||
            item.sellingPrice.toString().includes(searchTerm) ||
            (item.discount && item.discount.toString().includes(searchTerm))
        );
    }

    // Save store items and update cache
    async saveStoreItems(storeItems: Omit<Store, 'id'>[]): Promise<Store[]> {
        try {
            const timestamp = new Date();

            // Generate IDs for each store item
            const itemsWithIds = storeItems.map(item => ({
                ...item,
                id: uuidv4(),
                createdAt: timestamp
            }));

            // Save each item to Firebase
            const savedItems: Store[] = [];
            for (const item of itemsWithIds) {
                const savedItem = await saveDocument<Store>(this.collectionName, item);
                if (savedItem) {
                    savedItems.push(savedItem);
                }
            }

            // Update the cache with the new items
            const cachedItems = getFromCache<Store[]>(CACHE_KEYS.STORE_CACHE_KEY) || [];
            const updatedCache = [...cachedItems, ...savedItems];
            saveToCache(CACHE_KEYS.STORE_CACHE_KEY, updatedCache);

            // Mark the collection as updated
            markCollectionUpdated(COLLECTION_KEYS.STORE);

            return savedItems;
        } catch (error) {
            console.error("Error saving store items:", error);
            toast.error("Failed to save inventory items");
            throw error;
        }
    }
}

// Export singleton instance
export const storeService = new StoreService();
