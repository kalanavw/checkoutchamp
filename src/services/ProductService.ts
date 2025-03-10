import {Product} from "@/types/product.ts";
import {findByFilter, findById, insertOne, PRODUCT_COLLECTION} from "@/lib/firebase.ts";
// @ts-ignore
import {v4 as uuidv4} from 'uuid';

export class ProductService {

    async searchProducts(searchTerm: string): Promise<Product[]> {
        try {
            // Create search filters for name, barcode, and sku
            const nameFilters = [
                {field: 'name', operator: '>=', value: searchTerm},
                {field: 'name', operator: '<=', value: searchTerm + '\uf8ff'}
            ];

            const barcodeFilters = [
                {field: 'barcode', operator: '>=', value: searchTerm},
                {field: 'barcode', operator: '<=', value: searchTerm + '\uf8ff'}
            ];

            const skuFilters = [
                {field: 'sku', operator: '>=', value: searchTerm},
                {field: 'sku', operator: '<=', value: searchTerm + '\uf8ff'}
            ];

            // Firebase doesn't support $or queries like MongoDB
            // So we need to run multiple queries and combine the results
            const [nameResults, barcodeResults, skuResults] = await Promise.all([
                findByFilter<Product>(PRODUCT_COLLECTION, nameFilters),
                findByFilter<Product>(PRODUCT_COLLECTION, barcodeFilters),
                findByFilter<Product>(PRODUCT_COLLECTION, skuFilters)
            ]);

            // Combine and remove duplicates
            const allResults = [...nameResults, ...barcodeResults, ...skuResults];
            const uniqueResults = Array.from(new Map(allResults.map(item => [item.id, item])).values());
            return uniqueResults.slice(0, 10); // Limit to 10 results
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

            const result = await insertOne<Product>(PRODUCT_COLLECTION, newProduct);

            return result || newProduct;
        } catch (error) {
            console.error("Error creating product:", error);
            throw error;
        }
    }
}

export const productService = new ProductService();