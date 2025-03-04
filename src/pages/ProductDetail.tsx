
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
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

// Cache key
const PRODUCTS_CACHE_KEY = "products_cache";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
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
        
        if (cachedProduct && isCacheValid(cacheKey)) {
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
          
          // Save to cache
          saveToCache(cacheKey, productWithId);
        } else {
          toast({
            title: "Error",
            description: "Product not found",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, toast]);

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
        <Card className="md:col-span-2 bg-secondary/30 border-theme-light">
          <CardHeader className="bg-gradient-to-r from-secondary to-secondary/50 rounded-t-lg">
            <CardTitle className="text-2xl">{product.name}</CardTitle>
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
