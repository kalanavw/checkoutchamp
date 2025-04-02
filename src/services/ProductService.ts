
import {Product} from "@/types/product.ts";
import {createSearchFilters, findById, findByFilter, PRODUCT_COLLECTION} from "@/lib/firebase.ts";
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
            if (!searchTerm || searchTerm.trim() === '') {
                // If empty search term, return all products from cache
                return await cacheAwareDBService.fetchDocuments<Product>(this.collectionData);
            }
            
            // Create a search cache key based on the search term
            const searchCacheKey = `${CACHE_KEYS.PRODUCTS_CACHE_KEY}_search_${searchTerm.toLowerCase()}`;
            
            // Try to get from cache first
            const cachedResults = await cacheAwareDBService.getFromCacheWithKey<Product[]>(searchCacheKey);
            if (cachedResults && cachedResults.length > 0) {
                console.log("Using cached search results for:", searchTerm);
                return cachedResults;
            }
            
            // Not in cache, search across multiple fields
            const searchLower = searchTerm.toLowerCase();
            
            // Get all products first
            const allProducts = await cacheAwareDBService.fetchDocuments<Product>(this.collectionData);
            
            // Filter in memory for flexible search across multiple fields
            const results = allProducts.filter(product => {
                // Check product name
                if (product.name.toLowerCase().includes(searchLower)) return true;
                
                // Check product code
                if (product.productCode && product.productCode.toLowerCase().includes(searchLower)) return true;
                
                // Check barcode
                if (product.barcode && product.barcode.toLowerCase().includes(searchLower)) return true;
                
                // Check category
                if (product.category && product.category.toLowerCase().includes(searchLower)) return true;
                
                // Check subcategory
                if (product.subcategory && product.subcategory.toLowerCase().includes(searchLower)) return true;
                
                // Check keywords
                if (product.keywords && product.keywords.some(keyword => 
                    keyword.toLowerCase().includes(searchLower))) return true;
                
                return false;
            });
            
            // Cache the search results
            if (results.length > 0) {
                await cacheAwareDBService.saveToCache(searchCacheKey, results);
            }
            
            return results;
        } catch (error) {
            console.error("Error searching products:", error);
            return [];
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
