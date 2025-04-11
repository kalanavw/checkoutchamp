
import {Invoice} from '@/types/invoce';
// @ts-ignore
import {v4 as uuidv4} from 'uuid';
import {CollectionData} from "@/utils/collectionData.ts";
import {INVOICE_COLLECTION} from "@/lib/firebase.ts";
import {COLLECTION_KEYS} from "@/utils/collectionUtils.ts";
import {cacheAwareDBService} from "@/services/CacheAwareDBService.ts";
import {storeService} from "@/services/StoreService.ts";
import {generateCustomUUID} from "@/utils/Util.ts";
import {INVOICE_CACHE_KEY} from "@/constants/cacheKeys.ts";

export class InvoiceService {
    collectionData: CollectionData<Invoice> = {
        collection: INVOICE_COLLECTION,
        collectionKey: COLLECTION_KEYS.INVOICE,
        cacheKey: INVOICE_CACHE_KEY,
        document: null
    }
    // Create invoice
    async createInvoice(invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'invoiceDate'>): Promise<Invoice> {
        try {
            const now = new Date();
            
            // Generate an ID for the invoice
            const id = generateCustomUUID();

            // Generate invoice number (format: INV-YYYYMMDD-XXXX) todo
            const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
            const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
            const invoiceNumber = `INV-${dateStr}-${randomStr}`;

            const newInvoice: Invoice = {
                id,
                invoiceNumber,
                invoiceDate: now,
                ...invoiceData
            };
            this.collectionData.document = newInvoice;
            const result = await cacheAwareDBService.saveDocument<Invoice>(this.collectionData);
            await storeService.updateProductQuantityAfterInvoice(result);
            return result || newInvoice;
        } catch (error) {
            console.error("Error creating invoice:", error);
            throw error;
        }
    }

    // Get invoice by ID
    async getInvoiceById(id: string): Promise<Invoice | null> {
        try {
            return await cacheAwareDBService.findById<Invoice>(this.collectionData, id);
        } catch (error) {
            console.error("Error getting invoice by ID:", error);
            return null;
        }
    }

    // Get all invoices
    async getInvoices(forceRefresh: boolean = false): Promise<Invoice[]> {
        try {
            const invoices = await cacheAwareDBService.fetchDocuments<Invoice>(this.collectionData);
            
            // Process dates to ensure they are proper Date objects
            return invoices.map(invoice => ({
                ...invoice,
                invoiceDate: this.ensureDate(invoice.invoiceDate),
                createdAt: this.ensureDate(invoice.createdAt),
                modifiedDate: this.ensureDate(invoice.modifiedDate)
            }));
        } catch (error) {
            console.error("Error getting invoices:", error);
            return [];
        }
    }
    
    // Helper method to ensure date values are proper Date objects
    private ensureDate(dateValue: any): Date | undefined {
        if (!dateValue) return undefined;
        
        try {
            // If it's already a Date object
            if (dateValue instanceof Date) return dateValue;
            
            // If it's a Firebase timestamp with seconds and nanoseconds
            if (dateValue.seconds !== undefined && dateValue.nanoseconds !== undefined) {
                return new Date(dateValue.seconds * 1000);
            }
            
            // If it's a string date, parse it
            if (typeof dateValue === 'string') {
                const parsed = new Date(dateValue);
                return isNaN(parsed.getTime()) ? undefined : parsed;
            }
            
            // If it's a number (timestamp)
            if (typeof dateValue === 'number') {
                return new Date(dateValue);
            }
            
            return undefined;
        } catch (error) {
            console.error("Error processing date:", error);
            return undefined;
        }
    }
    
    // Update invoice status
    async updateInvoiceStatus(id: string, status: string): Promise<boolean> {
        try {
            const invoice = await this.getInvoiceById(id);
            if (!invoice) return false;
            
            invoice.status = status;
            invoice.modifiedDate = new Date();
            
            this.collectionData.document = invoice;
            await cacheAwareDBService.saveDocument<Invoice>(this.collectionData);
            return true;
        } catch (error) {
            console.error("Error updating invoice status:", error);
            return false;
        }
    }
}

// Export singleton instance
export const invoiceService = new InvoiceService();
