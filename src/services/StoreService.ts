
import {toast} from 'sonner';
import {COLLECTION_KEYS, markCollectionUpdated} from '@/utils/collectionUtils';
import {CACHE_KEYS, getFromCache, saveToCache} from '@/utils/cacheUtils';
import {STORE_COLLECTION} from '@/lib/firebase';
import {Store} from "@/types/store.ts";
import {CollectionData} from "@/utils/collectionData.ts";
import {cacheAwareDBService} from "@/services/CacheAwareDBService.ts";
import {Invoice} from "@/types/invoce.ts";
import {productService} from '@/services/ProductService.ts';

export class StoreService {
    collectionData: CollectionData<Store> = {
        collection: STORE_COLLECTION,
        collectionKey: COLLECTION_KEYS.STORE,
        cacheKey: CACHE_KEYS.STORE_CACHE_KEY,
        document: null
    }
    
    // Get all store items with improved caching
    async getStoreItems(forceRefresh = false): Promise<Store[]> {
        try {
            if (forceRefresh) {
                console.log('Force refreshing store data from Firebase');
                // Clear cache if force refreshing
                this.clearStoreCache();
            }
            
            return await cacheAwareDBService.fetchDocuments<Store>(this.collectionData);
        } catch (error) {
            console.error("Error getting store items:", error);
            toast.error("Failed to fetch store items. Using mock data.");
            return [];
        }
    }

    // Get a single store item by ID with cache handling
    async getStoreItemById(id: string): Promise<Store | null> {
        try {
            // First try to find the store item in the cache
            const cachedStoreItems = getFromCache<Store[]>(CACHE_KEYS.STORE_CACHE_KEY);
            
            if (cachedStoreItems && cachedStoreItems.length > 0) {
                const cachedItem = cachedStoreItems.find(item => item.id === id);
                if (cachedItem) {
                    console.log(`Found store item ${id} in cache`);
                    return cachedItem;
                }
            }
            
            // If not in cache, fetch from Firebase
            console.log(`Fetching store item ${id} from Firebase`);
            return await cacheAwareDBService.findById<Store>(this.collectionData, id);
        } catch (error) {
            console.error(`Error getting store item by ID ${id}:`, error);
            return null;
        }
    }

    // Clear the store cache
    clearStoreCache(): void {
        console.log('Clearing store cache');
        saveToCache(CACHE_KEYS.STORE_CACHE_KEY, []);
    }

    // Enhanced search store items with comprehensive field search and null/undefined safety
    searchStoreItems(term: string, items: Store[]): Store[] {
        if (!term?.trim()) return items;

        const searchTerm = term.toLowerCase();
        return items.filter(item => {
            // Safe check function to handle potentially undefined values
            const safeIncludes = (value: string | number | undefined | null): boolean => {
                if (value === undefined || value === null) return false;
                return String(value).toLowerCase().includes(searchTerm);
            };

            return (
                // Product fields - with null/undefined safety
                safeIncludes(item.product?.name) ||
                safeIncludes(item.product?.productCode) ||
                safeIncludes(item.product?.barcode) ||
                safeIncludes(item.product?.category) ||
                safeIncludes(item.product?.subcategory) ||

                // Location fields
                safeIncludes(item.location?.name) ||
                safeIncludes(item.location?.code) ||

                // Store specific fields
                safeIncludes(item.grnNumber) ||

                // Price related search
                safeIncludes(item.costPrice) ||
                safeIncludes(item.sellingPrice) ||
                safeIncludes(item.discount)
            );
        });
    }
    
    // Search products by term - utilizes the centralized ProductService
    async searchProducts(term: string): Promise<Store[]> {
        try {
            if (!term?.trim()) {
                return this.getStoreItems();
            }
            
            // First get all store items
            const storeItems = await this.getStoreItems();
            
            // Use the enhanced search
            return this.searchStoreItems(term, storeItems);
        } catch (error) {
            console.error("Error searching products:", error);
            return [];
        }
    }

    // Update store item in cache
    private updateStoreItemInCache(storeItem: Store): void {
        const cachedItems = getFromCache<Store[]>(CACHE_KEYS.STORE_CACHE_KEY) || [];
        const updatedCache = cachedItems.filter(item => item.id !== storeItem.id);
        updatedCache.push(storeItem);
        saveToCache(CACHE_KEYS.STORE_CACHE_KEY, updatedCache);
        console.log(`Updated store item ${storeItem.id} in cache`);
    }

    // Save store items and update cache
    async saveStoreItems(storeItems: Store[]): Promise<Store[]> {
        try {
            // Save each item to Firebase
            const savedItems: Store[] = [];
            for (const item of storeItems) {
                this.collectionData.document = item;
                const savedItem = await cacheAwareDBService.saveDocument<Store>(this.collectionData);
                if (savedItem) {
                    savedItems.push(savedItem);
                    this.updateStoreItemInCache(savedItem);
                }
            }

            // Mark the collection as updated
            markCollectionUpdated(COLLECTION_KEYS.STORE);

            return savedItems;
        } catch (error) {
            console.error("Error saving store items:", error);
            throw error;
        }
    }

    async updateProductQuantityAfterInvoice(result: Invoice) {
        try {
            let updateable: Store[] = [];
            
            if (result && result.products.length > 0) {
                for (const product of result.products) {
                    // Get the store item with cache awareness
                    const store: Store = await this.getStoreItemById(product.storeId);
                    
                    if (store) {
                        // Update the available quantity
                        store.qty.availableQty = store.qty.availableQty - product.quantity;
                        updateable.push(store);
                    } else {
                        console.error(`Store item with ID ${product.storeId} not found`);
                    }
                }
                
                if (updateable.length > 0) {
                    // Update all items in one batch
                    this.collectionData.documents = updateable;
                    const savedItems = await cacheAwareDBService.saveDocuments(this.collectionData);
                    
                    // Update each item in the cache
                    if (savedItems) {
                        savedItems.forEach(item => this.updateStoreItemInCache(item));
                    }
                    
                    console.log(`Updated ${updateable.length} store items after invoice`);
                    return savedItems;
                }
            }
            return null;
        } catch (error) {
            console.error("Error updating product quantities after invoice:", error);
            toast.error("Failed to update product quantities after invoice");
            throw error;
        }
    }
}

// Export singleton instance
export const storeService = new StoreService();
