import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Notifications} from "@/utils/notifications.ts";
import {db, PRODUCT_COLLECTION} from "@/lib/firebase.ts";
import {doc, getDoc} from "firebase/firestore";
import {Product} from "@/types/product.ts";

// Imported components
import {ProductDetailHeader} from "@/components/product/ProductDetailHeader.tsx";
import ProductInfo from "@/components/product/ProductInfo.tsx";
import {QuickActions} from "@/components/product/QuickActions.tsx";
import {SalesInformation} from "@/components/product/SalesInformation.tsx";
import {ProductNotFound} from "@/components/product/ProductNotFound.tsx";
import {LoadingSpinner} from "@/components/ui/LoadingSpinner.tsx";
import {getFromCache, isCacheValid, saveToCache} from "@/utils/cacheUtils.ts";
import {COLLECTION_KEYS, saveCollectionFetchTime, shouldFetchCollection} from "@/utils/collectionUtils.ts";

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
            category: productData.category || "",
            subcategory: productData.subcategory || "",
            keywords: productData.keywords || [],
            barcode: productData.barcode,
            imageUrl: productData.imageUrl,
            description: productData.description,
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
