import {Product} from "@/types/product.ts";
import {createSearchFilters, findAll, findByFilter, PRODUCT_COLLECTION} from "@/lib/firebase.ts";
// @ts-ignore
import {v4 as uuidv4} from 'uuid';
import {CollectionData} from "@/utils/collectionData.ts";
import {COLLECTION_KEYS} from "@/utils/collectionUtils.ts";
import {CACHE_KEYS} from "@/utils/cacheUtils.ts";
import {cacheAwareDBService} from "@/services/CacheAwareDBService.ts";
import {getFromCache, isCacheValid, saveToCache} from "@/utils/cacheUtils.ts";

export class ProductService {
    collectionData: CollectionData<Product> = {
        collection: PRODUCT_COLLECTION,
        collectionKey: COLLECTION_KEYS.PRODUCTS,
        cacheKey: CACHE_KEYS.PRODUCTS_CACHE_KEY,
        document: null
    }

    async searchProducts(searchTerm: string): Promise<Product[]> {
        try {
            // If searchTerm is empty, return all products
            if (!searchTerm || searchTerm.trim() === '') {
                return this.getAllProducts();
            }

            const searchTermLower = searchTerm.toLowerCase();
            
            // First check if we have valid cache
            if (isCacheValid(CACHE_KEYS.PRODUCTS_CACHE_KEY)) {
                // Get all products from cache
                const cachedProducts = getFromCache<Product[]>(CACHE_KEYS.PRODUCTS_CACHE_KEY) || [];
                
                if (cachedProducts.length > 0) {
                    console.log('Searching in cached products');
                    // Filter products in memory
                    return this.filterProductsByTerm(cachedProducts, searchTermLower);
                }
            }
            
            // If no cache or no results from cache, fetch from Firebase
            console.log('Searching products from Firebase');
            
            // Since Firebase doesn't support proper text search, fetch all and filter in-memory
            const products = await findAll<Product>(PRODUCT_COLLECTION);
            
            // Update the cache
            saveToCache(CACHE_KEYS.PRODUCTS_CACHE_KEY, products);
            
            // Filter and return products
            return this.filterProductsByTerm(products, searchTermLower);
        } catch (error) {
            console.error("Error searching products:", error);
            return [];
        }
    }
    
    private filterProductsByTerm(products: Product[], searchTermLower: string): Product[] {
        return products.filter(product => {
            // Check name
            if (product.name.toLowerCase().includes(searchTermLower)) return true;
            
            // Check product code
            if (product.productCode && product.productCode.toLowerCase().includes(searchTermLower)) return true;
            
            // Check category
            if (product.category.toLowerCase().includes(searchTermLower)) return true;
            
            // Check subcategory
            if (product.subcategory.toLowerCase().includes(searchTermLower)) return true;
            
            // Check barcode
            if (product.barcode && product.barcode.toLowerCase().includes(searchTermLower)) return true;
            
            // Check description
            if (product.description && product.description.toLowerCase().includes(searchTermLower)) return true;
            
            // Check keywords
            if (product.keywords && product.keywords.some(keyword => 
                keyword.toLowerCase().includes(searchTermLower))) return true;
            
            return false;
        });
    }
    
    async getAllProducts(): Promise<Product[]> {
        try {
            if (isCacheValid(CACHE_KEYS.PRODUCTS_CACHE_KEY)) {
                const cachedProducts = getFromCache<Product[]>(CACHE_KEYS.PRODUCTS_CACHE_KEY);
                if (cachedProducts && cachedProducts.length > 0) {
                    return cachedProducts;
                }
            }
            
            const products = await findAll<Product>(PRODUCT_COLLECTION);
            saveToCache(CACHE_KEYS.PRODUCTS_CACHE_KEY, products);
            return products;
        } catch (error) {
            console.error("Error getting all products:", error);
            return [];
        }
    }

    // Get product by ID
    async getProductById(id: string): Promise<Product | null> {
        try {
            return await cacheAwareDBService.findById<Product>(this.collectionData, id);
        } catch (error) {
            console.error("Error getting product by ID:", error);
            return null;
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

    // Update product
    async updateProduct(product: Product): Promise<Product | null> {
        try {
            this.collectionData.document = product;
            const result = await cacheAwareDBService.saveDocument<Product>(this.collectionData);
            
            // Update specific product in cache
            if (result) {
                // Also update in the products list cache if it exists
                const productsCache = getFromCache<Product[]>(CACHE_KEYS.PRODUCTS_CACHE_KEY);
                if (productsCache) {
                    const updatedCache = productsCache.map(p => 
                        p.id === product.id ? product : p
                    );
                    saveToCache(CACHE_KEYS.PRODUCTS_CACHE_KEY, updatedCache);
                }
                
                // Update individual product cache
                const productCacheKey = `${CACHE_KEYS.PRODUCTS_CACHE_KEY}_${product.id}`;
                saveToCache(productCacheKey, product);
            }
            
            return result;
        } catch (error) {
            console.error("Error updating product:", error);
            return null;
        }
    }
}

export const productService = new ProductService();
