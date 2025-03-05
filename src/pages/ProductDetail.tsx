import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notifications } from "@/utils/notifications";
import { db, PRODUCT_COLLECTION } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Product } from "@/types/product";

// Imported components
import { ProductDetailHeader } from "@/components/product/ProductDetailHeader";
import ProductInfo from "@/components/product/ProductInfo";
import { QuickActions } from "@/components/product/QuickActions";
import { SalesInformation } from "@/components/product/SalesInformation";
import { ProductNotFound } from "@/components/product/ProductNotFound";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { isCacheValid, saveToCache, getFromCache } from "@/utils/cacheUtils";
import { 
  COLLECTION_KEYS, 
  shouldFetchCollection,
  saveCollectionFetchTime
} from "@/utils/collectionUtils";

// Cache key
const PRODUCTS_CACHE_KEY = "products_cache";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Try to get from cache first
        const cacheKey = `${PRODUCTS_CACHE_KEY}_${id}`;
        const cachedProduct = getFromCache<Product>(cacheKey);
        
        // Check if we need to refresh data based on collection timestamps
        const shouldRefresh = shouldFetchCollection(COLLECTION_KEYS.PRODUCTS);
        
        if (cachedProduct && !shouldRefresh && isCacheValid(cacheKey)) {
          setProduct(cachedProduct);
          setLoading(false);
          console.log("Using cached product");
          return;
        }
        
        // Fetch from Firestore if not in cache or cache is invalid
        const productDoc = await getDoc(doc(db, PRODUCT_COLLECTION, id));
        
        if (productDoc.exists()) {
          const productData = productDoc.data() as Record<string, any>;
          const productWithId: Product = { 
            id: productDoc.id,
            name: productData.name || "",
            costPrice: productData.costPrice || 0,
            sellingPrice: productData.sellingPrice || 0,
            stock: productData.stock || 0,
            category: productData.category || "",
            subcategory: productData.subcategory || "",
            location: productData.location as "loc-1" | "loc-2" || "loc-1",
            keywords: productData.keywords || [],
            discount: productData.discount,
            grnNumber: productData.grnNumber,
            barcode: productData.barcode,
            imageUrl: productData.imageUrl,
            description: productData.description,
            sku: productData.sku,
            specifications: productData.specifications,
            createdAt: productData.createdAt ? new Date(productData.createdAt.toDate()) : undefined,
            createdBy: productData.createdBy || "Unknown",
            modifiedDate: productData.modifiedDate ? new Date(productData.modifiedDate.toDate()) : undefined,
            modifiedBy: productData.modifiedBy || "Unknown"
          };
          
          setProduct(productWithId);
          
          // Save to cache and update fetch timestamp for this product
          saveToCache(cacheKey, productWithId);
          saveCollectionFetchTime(COLLECTION_KEYS.PRODUCTS);
        } else {
          Notifications.error("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        Notifications.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return <ProductNotFound />;
  }

  return (
    <div className="container p-6 max-w-6xl mx-auto">
      <ProductDetailHeader productId={product.id} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-green-50/50 dark:bg-green-900/30 border-green-100 dark:border-green-800/50">
          <CardHeader className="bg-gradient-to-r from-green-100 to-green-50/50 dark:from-green-800/50 dark:to-green-900/30 rounded-t-lg">
            <CardTitle className="text-2xl text-green-800 dark:text-green-300">{product.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductInfo product={product} />
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <QuickActions productId={product.id} />
          <SalesInformation product={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
