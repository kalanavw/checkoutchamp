
import {Product} from "@/types/product.ts";
import {createSearchFilters, findAll, findByFilter, PRODUCT_COLLECTION} from "@/lib/firebase.ts";
// @ts-ignore
import {v4 as uuidv4} from 'uuid';
import {CollectionData} from "@/utils/collectionData.ts";
import {COLLECTION_KEYS} from "@/utils/collectionUtils.ts";
import {CACHE_KEYS, clearCache, getFromCache, isCacheValid, saveToCache} from "@/utils/cacheUtils.ts";
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
            // If searchTerm is empty, return all products
            if (!searchTerm || searchTerm.trim() === '') {
                return this.getAllProducts();
            }

            const searchTermLower = searchTerm.toLowerCase();
            
            // Get products from cache or fetch from Firebase
            const products = await this.getAllProducts();
            
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
                    console.log('Using cached products list');
                    return cachedProducts;
                }
            }
            
            console.log('Fetching products from Firebase');
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
            // First try to find the product in the cache
            const cachedProducts = getFromCache<Product[]>(CACHE_KEYS.PRODUCTS_CACHE_KEY);
            if (cachedProducts && cachedProducts.length > 0) {
                const cachedProduct = cachedProducts.find(p => p.id === id);
                if (cachedProduct) {
                    console.log(`Found product ${id} in cache`);
                    return cachedProduct;
                }
            }
            
            // If not in cache, fetch from Firebase
            console.log(`Fetching product ${id} from Firebase`);
            const product = await cacheAwareDBService.findById<Product>(this.collectionData, id);
            
            // If found, update the cache
            if (product) {
                this.updateProductInCache(product);
            }
            
            return product;
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
            
            // Update the cache with the new product
            if (result) {
                this.updateProductInCache(result);
            }

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
            
            // Update the cache
            if (result) {
                this.updateProductInCache(result);
            }
            
            return result;
        } catch (error) {
            console.error("Error updating product:", error);
            return null;
        }
    }
    
    // Delete product
    async deleteProduct(id: string): Promise<boolean> {
        try {
            // First try to remove from the cache
            const cachedProducts = getFromCache<Product[]>(CACHE_KEYS.PRODUCTS_CACHE_KEY);
            if (cachedProducts) {
                const updatedCache = cachedProducts.filter(p => p.id !== id);
                saveToCache(CACHE_KEYS.PRODUCTS_CACHE_KEY, updatedCache);
            }
            
            // Then delete from Firebase using cacheAwareDBService
            // This is a placeholder as the current cacheAwareDBService doesn't have a delete method
            // You would need to implement that functionality
            
            return true;
        } catch (error) {
            console.error("Error deleting product:", error);
            return false;
        }
    }
    
    // Update product in cache
    private updateProductInCache(product: Product): void {
        const cachedProducts = getFromCache<Product[]>(CACHE_KEYS.PRODUCTS_CACHE_KEY) || [];
        const updatedCache = cachedProducts.filter(p => p.id !== product.id);
        updatedCache.push(product);
        saveToCache(CACHE_KEYS.PRODUCTS_CACHE_KEY, updatedCache);
        console.log(`Updated product ${product.id} in cache`);
    }
}

export const productService = new ProductService();
