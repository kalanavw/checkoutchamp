import {Customer} from '@/types/customer';
// @ts-ignore
import {v4 as uuidv4} from 'uuid';
import {CUSTOMER_COLLECTION, findAll, findByFilter, findById} from '@/lib/firebase';
import {CollectionData} from "@/utils/collectionData.ts";
import {COLLECTION_KEYS} from "@/utils/collectionUtils.ts";
import {CACHE_KEYS} from "@/utils/cacheUtils.ts";
import {cacheAwareDBService} from "@/services/CacheAwareDBService.ts";

export class CustomerService {
    collectionData: CollectionData<Customer> = {
        collection: CUSTOMER_COLLECTION,
        collectionKey: COLLECTION_KEYS.CUSTOMERS,
        cacheKey: CACHE_KEYS.CUSTOMERS_CACHE_KEY,
        document: null
    }
    // Get all customers
    async getCustomers(): Promise<Customer[]> {
        try {
            return await findAll<Customer>(CUSTOMER_COLLECTION);
        } catch (error) {
            console.error("Error getting customers:", error);
        }
    }

    // Search customers
    async searchCustomers(searchTerm: string): Promise<Customer[]> {
        try {
            // Create search filters for name, phone, and email
            const nameFilters = [
                {field: 'name', operator: '>=', value: searchTerm},
                {field: 'name', operator: '<=', value: searchTerm + '\uf8ff'}
            ];

            const phoneFilters = [
                {field: 'phone', operator: '>=', value: searchTerm},
                {field: 'phone', operator: '<=', value: searchTerm + '\uf8ff'}
            ];

            const emailFilters = [
                {field: 'email', operator: '>=', value: searchTerm},
                {field: 'email', operator: '<=', value: searchTerm + '\uf8ff'}
            ];

            // Firebase doesn't support $or queries like MongoDB
            // So we need to run multiple queries and combine the results
            const [nameResults, phoneResults, emailResults] = await Promise.all([
                findByFilter<Customer>(CUSTOMER_COLLECTION, nameFilters),
                findByFilter<Customer>(CUSTOMER_COLLECTION, phoneFilters),
                findByFilter<Customer>(CUSTOMER_COLLECTION, emailFilters)
            ]);

            // Combine and remove duplicates
            const allResults = [...nameResults, ...phoneResults, ...emailResults];
            const uniqueResults = Array.from(new Map(allResults.map(item => [item.id, item])).values());

            return uniqueResults.slice(0, 10); // Limit to 10 results
        } catch (error) {
            console.error("Error searching customers:", error);

        }
    }

    // Create customer
    async createCustomer(customerData: {
        name: string;
        email: string;
        phone: string;
        type: 'retail' | 'wholesale';
    }): Promise<Customer> {
        try {
            const now = new Date();

            const newCustomer: Customer = {
                name: customerData.name,
                email: customerData.email,
                phone: customerData.phone,
                type: customerData.type,
                registrationDate: now
            };

            this.collectionData.document = newCustomer;
            const result = await cacheAwareDBService.saveDocument<Customer>(this.collectionData);

            return result || newCustomer;
        } catch (error) {
            console.error("Error creating customer:", error);
            throw error;
        }
    }

    // Get customer by ID
    async getCustomerById(id: string): Promise<Customer | null> {
        try {
            return await findById<Customer>(CUSTOMER_COLLECTION, id);
        } catch (error) {
            console.error("Error getting customer by ID:", error);
        }
    }
}

// Export singleton instance
export const customerService = new CustomerService();