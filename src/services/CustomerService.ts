import {Customer} from '@/types/customer';
// @ts-ignore
import {v4 as uuidv4} from 'uuid';
import {CUSTOMER_COLLECTION, db, findAll, findById} from '@/lib/firebase';
import {CollectionData} from "@/utils/collectionData.ts";
import {COLLECTION_KEYS} from "@/utils/collectionUtils.ts";
import {cacheAwareDBService} from "@/services/CacheAwareDBService.ts";
import {collection, getDocs, query, where} from 'firebase/firestore';
import {CUSTOMERS_CACHE_KEY} from "@/constants/cacheKeys.ts";

export class CustomerService {
    collectionData: CollectionData<Customer> = {
        collection: CUSTOMER_COLLECTION,
        collectionKey: COLLECTION_KEYS.CUSTOMERS,
        cacheKey: CUSTOMERS_CACHE_KEY,
        document: null
    }
    // Get all customers
    async getCustomers(): Promise<Customer[]> {
        try {
            return await findAll<Customer>(CUSTOMER_COLLECTION);
        } catch (error) {
            console.error("Error getting customers:", error);
            return [];
        }
    }

    // Search customers
    async searchCustomers(searchTerm: string): Promise<Customer[]> {
        try {
            // We need to use Firestore query directly since findByFilter doesn't support our use case
            const nameResults = await this.searchByField('name', searchTerm);
            const phoneResults = await this.searchByField('phone', searchTerm);
            const emailResults = await this.searchByField('email', searchTerm);

            // Combine and remove duplicates
            const allResults = [...nameResults, ...phoneResults, ...emailResults];
            const uniqueResults = Array.from(new Map(allResults.map(item => [item.id, item])).values());

            return uniqueResults.slice(0, 10); // Limit to 10 results
        } catch (error) {
            console.error("Error searching customers:", error);
            return [];
        }
    }

    private async searchByField(field: string, searchTerm: string): Promise<Customer[]> {
        try {
            const collectionRef = collection(db, CUSTOMER_COLLECTION);
            const q = query(
                collectionRef, 
                where(field, '>=', searchTerm), 
                where(field, '<=', searchTerm + '\uf8ff')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Customer[];
        } catch (error) {
            console.error(`Error searching customers by ${field}:`, error);
            return [];
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
            
            // Generate ID before saving to ensure it exists
            const id = uuidv4();

            const newCustomer: Customer = {
                id,
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
            return null;
        }
    }
}

// Export singleton instance
export const customerService = new CustomerService();
