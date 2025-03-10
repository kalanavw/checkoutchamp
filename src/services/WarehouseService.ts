import {v4 as uuidv4} from 'uuid';
import {findAll, insertOne, WAREHOUSE_COLLECTION} from '@/lib/firebase';
import {toast} from 'sonner';
import {Warehouse} from "@/types/warehouse.ts";

export class WarehouseService {


    async getLocations(): Promise<Warehouse[]> {
        try {
            const warehouses = await findAll<Warehouse>(WAREHOUSE_COLLECTION);
            return warehouses;
        } catch (error) {
            console.error('Error fetching warehouses:', error);
            toast.error('Failed to load warehouses');
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

            const savedWarehouse = await insertOne<Warehouse>(WAREHOUSE_COLLECTION, newWarehouse);

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