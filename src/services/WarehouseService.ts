import {WAREHOUSE_COLLECTION} from '@/lib/firebase';
import {Warehouse} from "@/types/warehouse.ts";
import {COLLECTION_KEYS} from "@/utils/collectionUtils.ts";
import {cacheAwareDBService} from "@/services/CacheAwareDBService.ts";
import {CollectionData} from "@/utils/collectionData.ts";
import {Notifications} from "@/utils/notifications.ts";
import {WAREHOUSE_CACHE_KEY} from "@/constants/cacheKeys.ts";

export class WarehouseService {

    collectionData: CollectionData<Warehouse> = {
        collection: WAREHOUSE_COLLECTION,
        collectionKey: COLLECTION_KEYS.WAREHOUSE,
        cacheKey: WAREHOUSE_CACHE_KEY,
        document: null
    }

    async fetchWarehouses(): Promise<Warehouse[]> {
        try {
            return cacheAwareDBService.fetchDocuments<Warehouse>(this.collectionData);
        } catch (error) {
            console.error('Error fetching warehouses:', error);
            return [];
        }
    }

    async createWareHouse(warehouse: Omit<Warehouse, 'id'>): Promise<Warehouse> {
        try {
            const id = "G";
            
            this.collectionData.document = {
                id,
                ...warehouse
            };
            
            const savedWarehouse = await cacheAwareDBService.saveDocument<Warehouse>(this.collectionData);

            Notifications.success('Warehouse added successfully');
            return savedWarehouse;
        } catch (error) {
            console.error('Error adding warehouse:', error);
            throw error;
        }
    }
}

export const warehouseService = new WarehouseService();
