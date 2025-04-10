import {collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where} from "firebase/firestore";
import {CUSTOMER_COLLECTION, db} from "@/lib/firebase";
import {Customer} from "@/types/customer";
import {getFromCache, saveToCache} from "@/utils/cacheUtils.ts";
import {COLLECTION_KEYS, saveCollectionUpdateTime} from "@/utils/collectionUtils";
import {CUSTOMERS_CACHE_KEY} from "@/constants/cacheKeys";
import {cacheAwareDBService} from "@/services/CacheAwareDBService.ts";
import {CollectionData} from "@/utils/collectionData.ts";

export class CustomerService {
    collectionData: CollectionData<Customer> = {
        collection: CUSTOMER_COLLECTION,
        collectionKey: COLLECTION_KEYS.CUSTOMER,
        cacheKey: CUSTOMERS_CACHE_KEY,
        document: null
    }
    
    async getAllCustomers(): Promise<Customer[]> {
        try {
            const customersCache = getFromCache<Customer[]>(CUSTOMERS_CACHE_KEY);
            if (customersCache) {
                console.log("Customers from cache");
                return customersCache;
            }

            const customersRef = collection(db, CUSTOMER_COLLECTION);
            const querySnapshot = await getDocs(customersRef);
            const customers: Customer[] = [];

            querySnapshot.forEach((doc) => {
                customers.push({ id: doc.id, ...doc.data() } as Customer);
            });

            saveToCache(CUSTOMERS_CACHE_KEY, customers);
            return customers;
        } catch (error) {
            console.error("Error fetching customers:", error);
            throw error;
        }
    }

    async getCustomers(): Promise<Customer[]> {
        return this.getAllCustomers();
    }

    async searchCustomers(searchTerm: string): Promise<Customer[]> {
        try {
            const allCustomers = await this.getAllCustomers();
            
            if (!searchTerm?.trim()) {
                return allCustomers;
            }
            
            const term = searchTerm.toLowerCase();
            return allCustomers.filter(customer => {
                return (
                    customer.name?.toLowerCase().includes(term) ||
                    customer.phone?.toLowerCase().includes(term) ||
                    customer.email?.toLowerCase().includes(term) ||
                    customer.address?.toLowerCase().includes(term)
                );
            });
        } catch (error) {
            console.error("Error searching customers:", error);
            return [];
        }
    }

    async getCustomerById(id: string): Promise<Customer | null> {
        try {
            const customerCache = getFromCache<Customer>(`${CUSTOMERS_CACHE_KEY}_${id}`);
            if (customerCache) {
                console.log("Customer from cache");
                return customerCache;
            }

            const customerDocRef = doc(db, CUSTOMER_COLLECTION, id);
            const customerDocSnap = await getDoc(customerDocRef);

            if (customerDocSnap.exists()) {
                const customer = { id: customerDocSnap.id, ...customerDocSnap.data() } as Customer;
                saveToCache(`${CUSTOMERS_CACHE_KEY}_${id}`, customer);
                return customer
            } else {
                console.log("Customer not found");
                return null;
            }
        } catch (error) {
            console.error("Error fetching customer:", error);
            throw error;
        }
    }

    async createCustomer(customer: Customer): Promise<Customer> {
        try {
            this.collectionData.document = customer;
            const newCustomer = await cacheAwareDBService.saveDocument<Customer>(this.collectionData);

            saveCollectionUpdateTime(COLLECTION_KEYS.CUSTOMER);
            saveToCache(`${CUSTOMERS_CACHE_KEY}_${newCustomer.id}`, newCustomer);
            return newCustomer;
        } catch (error) {
            console.error("Error creating customer:", error);
            throw error;
        }
    }

    async updateCustomer(id: string, updates: Partial<Customer>): Promise<void> {
        try {
            const customerDocRef = doc(db, CUSTOMER_COLLECTION, id);
            await updateDoc(customerDocRef, updates);
            saveCollectionUpdateTime(COLLECTION_KEYS.CUSTOMER);
            const updatedCustomer = { id, ...updates } as Customer;
            saveToCache(`${CUSTOMERS_CACHE_KEY}_${id}`, updatedCustomer);
        } catch (error) {
            console.error("Error updating customer:", error);
            throw error;
        }
    }

    async deleteCustomer(id: string): Promise<void> {
        try {
            const customerDocRef = doc(db, CUSTOMER_COLLECTION, id);
            await deleteDoc(customerDocRef);
            saveCollectionUpdateTime(COLLECTION_KEYS.CUSTOMER);
        } catch (error) {
            console.error("Error deleting customer:", error);
            throw error;
        }
    }

    async getCustomerByEmail(email: string): Promise<Customer | null> {
        try {
            const customersRef = collection(db, CUSTOMER_COLLECTION);
            const q = query(customersRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const customerDoc = querySnapshot.docs[0];
                return { id: customerDoc.id, ...customerDoc.data() } as Customer;
            } else {
                console.log("No customer found with this email.");
                return null;
            }
        } catch (error) {
            console.error("Error fetching customer by email:", error);
            throw error;
        }
    }
}

// Export singleton instance
export const customerService = new CustomerService();
