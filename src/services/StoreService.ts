
import {toast} from 'sonner';
import {COLLECTION_KEYS, markCollectionUpdated} from '@/utils/collectionUtils';
import {CACHE_KEYS, getFromCache, saveToCache} from '@/utils/cacheUtils';
import {STORE_COLLECTION} from '@/lib/firebase';
import {Store} from "@/types/store.ts";
import {CollectionData} from "@/utils/collectionData.ts";
import {cacheAwareDBService} from "@/services/CacheAwareDBService.ts";
import {Invoice} from "@/types/invoce.ts";

export class StoreService {
    collectionData: CollectionData<Store> = {
        collection: STORE_COLLECTION,
        collectionKey: COLLECTION_KEYS.STORE,
        cacheKey: CACHE_KEYS.STORE_CACHE_KEY,
        document: null
    }
    // Get all store items
    async getStoreItems(): Promise<Store[]> {
        try {
            return await cacheAwareDBService.fetchDocuments<Store>(this.collectionData);
        } catch (error) {
            console.error("Error getting store items:", error);
            toast.error("Failed to fetch store items. Using mock data.");
        }
    }

    // Enhanced search store items with comprehensive field search 
    searchStoreItems(term: string, items: Store[]): Store[] {
        if (!term.trim()) return items;

        const searchTerm = term.toLowerCase();
        return items.filter(item =>
            // Product fields
            item.product.name.toLowerCase().includes(searchTerm) ||
            (item.product.productCode && item.product.productCode.toLowerCase().includes(searchTerm)) ||
            (item.product.barcode && item.product.barcode.toLowerCase().includes(searchTerm)) ||
            (item.product.category && item.product.category.toLowerCase().includes(searchTerm)) ||
            (item.product.subcategory && item.product.subcategory.toLowerCase().includes(searchTerm)) ||

            // Location fields
            item.location.name.toLowerCase().includes(searchTerm) ||
            item.location.code.toLowerCase().includes(searchTerm) ||

            // Store specific fields
            (item.grnNumber && item.grnNumber.toLowerCase().includes(searchTerm)) ||

            // Price related search (convert to string for searching)
            item.costPrice.toString().includes(searchTerm) ||
            item.sellingPrice.toString().includes(searchTerm) ||
            (item.discount && item.discount.toString().includes(searchTerm))
        );
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
            throw error;
        }
    }

    async updateProductQuantityAfterInvoice(result: Invoice) {
        let updateble: Store[] = [];
        if (result && result.products.length > 0) {
            for (const product of result.products) {
                const store: Store = await cacheAwareDBService.findById<Store>(this.collectionData, product.storeId);
                store.qty.availableQty = store.qty.availableQty - product.quantity;
                updateble.push(store)
            }
            this.collectionData.documents = updateble;
            await cacheAwareDBService.saveDocuments(this.collectionData);
        }
    }
}

// Export singleton instance
export const storeService = new StoreService();
