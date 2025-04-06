
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Notifications} from "@/utils/notifications.ts";
import {LoadingSpinner} from "@/components/ui/LoadingSpinner.tsx";
import {Product} from "@/types/product.ts";
import {productService} from "@/services/ProductService.ts";

// Imported components
import {ProductDetailHeader} from "@/components/product/ProductDetailHeader.tsx";
import ProductInfo from "@/components/product/ProductInfo.tsx";
import {QuickActions} from "@/components/product/QuickActions.tsx";
import {SalesInformation} from "@/components/product/SalesInformation.tsx";
import {ProductNotFound} from "@/components/product/ProductNotFound.tsx";
import ProductEditForm from "@/components/product/ProductEditForm.tsx";
import { useProductMetadata } from "@/hooks/products/useProductMetadata.ts";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Use the product metadata hook to get categories and subcategories
  const { categories, subcategories } = useProductMetadata();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch product
        const productData = await productService.getProductById(id);
        
        if (productData) {
          setProduct(productData);
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
      <ProductDetailHeader 
        productId={product.id} 
        isEditing={isEditing}
        onEditClick={() => setIsEditing(true)}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {isEditing ? (
            <ProductEditForm 
              product={product}
              categories={categories}
              subcategories={subcategories}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <Card className="bg-green-50/50 dark:bg-green-900/30 border-green-100 dark:border-green-800/50">
              <CardHeader className="bg-gradient-to-r from-green-100 to-green-50/50 dark:from-green-800/50 dark:to-green-900/30 rounded-t-lg">
                <CardTitle className="text-2xl text-green-800 dark:text-green-300">{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductInfo product={product} />
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <QuickActions productId={product.id} />
          <SalesInformation product={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
