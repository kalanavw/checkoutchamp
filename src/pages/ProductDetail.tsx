
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { db, PRODUCT_COLLECTION } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Product } from "@/types/product";

// Imported components
import { ProductDetailHeader } from "@/components/product/ProductDetailHeader";
import { ProductInfo } from "@/components/product/ProductInfo";
import { QuickActions } from "@/components/product/QuickActions";
import { SalesInformation } from "@/components/product/SalesInformation";
import { ProductNotFound } from "@/components/product/ProductNotFound";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const productDoc = await getDoc(doc(db, PRODUCT_COLLECTION, id));
        
        if (productDoc.exists()) {
          setProduct({ id: productDoc.id, ...productDoc.data() } as Product);
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
        <Card className="md:col-span-2">
          <CardHeader>
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
