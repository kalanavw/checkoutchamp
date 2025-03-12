import {v4 as uuidv4} from 'uuid';
import {saveDocument, WAREHOUSE_COLLECTION} from '@/lib/firebase';
import {toast} from 'sonner';
import {Warehouse} from "@/types/warehouse.ts";
import {COLLECTION_KEYS, saveCollectionFetchTime, shouldFetchCollection} from "@/utils/collectionUtils.ts";
import {CACHE_KEYS, getFromCache, isCacheValid, saveToCache} from "@/utils/cacheUtils.ts";
import {cacheAwareDBService} from "@/services/CacheAwareDBService.ts";

export class WarehouseService {


    async fetchWarehouses(): Promise<Warehouse[]> {
        try {
            return cacheAwareDBService.fetchDocuments<Warehouse>(WAREHOUSE_COLLECTION, COLLECTION_KEYS.WAREHOUSE, CACHE_KEYS.WAREHOUSE_CACHE_KEY);
        } catch (error) {
            console.error('Error fetching warehouses:', error);
            return [];
        }
    }

    async createLocation(location: Omit<Warehouse, 'id'>): Promise<Warehouse> {
        try {
            const newWarehouse = {
                id: uuidv4(),
                ...location,
                createdAt: new Date()
            };

            const savedWarehouse = await saveDocument<Warehouse>(WAREHOUSE_COLLECTION, newWarehouse);

            toast.success('Warehouse added successfully');
            return savedWarehouse || newWarehouse;
        } catch (error) {
            console.error('Error adding warehouse:', error);
            toast.error('Failed to add warehouse');
            throw error;
        }
    }

    async addLocation(name: string, code: string, description?: string): Promise<Warehouse> {
        return this.createLocation({name, code, description});
    }
}


export const warehouseService = new WarehouseService();