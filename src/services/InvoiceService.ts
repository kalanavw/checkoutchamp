import {Invoice} from '@/types/invoce';
// @ts-ignore
import {v4 as uuidv4} from 'uuid';
import {CollectionData} from "@/utils/collectionData.ts";
import {INVOICE_COLLECTION} from "@/lib/firebase.ts";
import {COLLECTION_KEYS} from "@/utils/collectionUtils.ts";
import {CACHE_KEYS} from "@/utils/cacheUtils.ts";
import {cacheAwareDBService} from "@/services/CacheAwareDBService.ts";

export class InvoiceService {
    collectionData: CollectionData<Invoice> = {
        collection: INVOICE_COLLECTION,
        collectionKey: COLLECTION_KEYS.INVOICE,
        cacheKey: CACHE_KEYS.INVOICE_CACHE_KEY,
        document: null
    }
    // Create invoice
    async createInvoice(invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'invoiceDate'>): Promise<Invoice> {
        try {
            const id = uuidv4();
            const now = new Date();

            // Generate invoice number (format: INV-YYYYMMDD-XXXX)
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
            return result || newInvoice;
        } catch (error) {
            console.error("Error creating invoice:", error);
            throw error;
        }
    }

    // Get invoice by ID
    async getInvoiceById(id: string): Promise<Invoice | null> {
        try {
            return null;
        } catch (error) {
            console.error("Error getting invoice by ID:", error);
            return null;
        }
    }

    // Get all invoices
    async getInvoices(): Promise<Invoice[]> {
        try {
            return [];
        } catch (error) {
            console.error("Error getting invoices:", error);
            return [];
        }
    }
}

// Export singleton instance
export const invoiceService = new InvoiceService();