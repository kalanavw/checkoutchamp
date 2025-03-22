import {Product} from "@/types/product.ts";
import {findById, PRODUCT_COLLECTION} from "@/lib/firebase.ts";
// @ts-ignore
import {v4 as uuidv4} from 'uuid';
import {CollectionData} from "@/utils/collectionData.ts";
import {COLLECTION_KEYS} from "@/utils/collectionUtils.ts";
import {CACHE_KEYS} from "@/utils/cacheUtils.ts";
import {cacheAwareDBService} from "@/services/CacheAwareDBService.ts";

export class ProductService {
    collectionData: CollectionData<Product> = {
        collection: PRODUCT_COLLECTION,
        collectionKey: COLLECTION_KEYS.PRODUCTS,
        cacheKey: CACHE_KEYS.PRODUCTS_CACHE_KEY,
        document: null
    }
    async searchProducts(searchTerm: string): Promise<Product[]> {
        try {
            // todo need to modify
            return await cacheAwareDBService.fetchDocuments<Product>(this.collectionData);
        } catch (error) {
            console.error("Error searching products:", error);
        }
    }

    // Get product by ID
    async getProductById(id: string): Promise<Product | null> {
        try {
            return await findById<Product>(PRODUCT_COLLECTION, id);
        } catch (error) {
            console.error("Error getting product by ID:", error);
        }
    }

    // Create product
    async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
        try {
            const id = uuidv4();
            const now = new Date();

            const newProduct: Product = {
                id,
                ...productData,
                createdAt: now,
                modifiedDate: now
            };
            this.collectionData.document = newProduct;

            const result = await cacheAwareDBService.saveDocument<Product>(this.collectionData);

            return result || newProduct;
        } catch (error) {
            console.error("Error creating product:", error);
            throw error;
        }
    }
}

export const productService = new ProductService();