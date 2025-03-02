
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {db, PRODUCT_COLLECTION, storage} from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Product } from "@/types/product";
import { 
  ArrowLeft, 
  Package, 
  Tag, 
  MapPin, 
  Truck, 
  Edit, 
  ShoppingBag, 
  Barcode, 
  Banknote 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
          navigate("/products");
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
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Product Not Found</h2>
          <p className="text-muted-foreground mt-2">The product you're looking for doesn't exist or has been removed.</p>
          <Button 
            onClick={() => navigate("/products")} 
            className="mt-4"
          >
            Go Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const calculateProfit = () => {
    const profit = product.sellingPrice - product.costPrice;
    const profitMargin = (profit / product.sellingPrice) * 100;
    return {
      amount: profit.toFixed(2),
      percentage: profitMargin.toFixed(2)
    };
  };

  const profit = calculateProfit();

  return (
    <div className="container p-6 max-w-6xl mx-auto">
      <div className="flex items-center mb-6 gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/products")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-7 w-7 text-primary" />
          Product Details
        </h1>
        <div className="ml-auto">
          <Button 
            onClick={() => navigate(`/edit-product/${product.id}`)} 
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">{product.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {product.category}
              </Badge>
              {product.subcategory && (
                <Badge variant="outline" className="bg-muted">
                  {product.subcategory}
                </Badge>
              )}
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <MapPin className="h-3 w-3 mr-1" />
                {product.location === "loc-1" ? "Location 1" : "Location 2"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Pricing Information</h3>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <h4 className="text-sm">Cost Price</h4>
                      <p className="text-xl font-semibold">${product.costPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm">Selling Price</h4>
                      <p className="text-xl font-semibold">${product.sellingPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm">Profit</h4>
                      <p className="text-xl font-semibold text-green-600">
                        ${profit.amount} ({profit.percentage}%)
                      </p>
                    </div>
                    {product.discount && (
                      <div>
                        <h4 className="text-sm">Discount</h4>
                        <p className="text-xl font-semibold text-orange-500">{product.discount}%</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Inventory Information</h3>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <h4 className="text-sm">Current Stock</h4>
                      <p className="text-xl font-semibold">
                        {product.stock} {product.stock > 0 ? 
                          <span className="text-green-600 text-sm font-normal">In Stock</span> : 
                          <span className="text-red-600 text-sm font-normal">Out of Stock</span>
                        }
                      </p>
                    </div>
                    {product.grnNumber && (
                      <div>
                        <h4 className="text-sm">Last GRN</h4>
                        <p className="text-lg">{product.grnNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {product.barcode && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Barcode</h3>
                    <Separator className="my-2" />
                    <div className="flex items-center gap-2">
                      <Barcode className="h-4 w-4 text-muted-foreground" />
                      <p className="text-lg font-mono">{product.barcode}</p>
                    </div>
                  </div>
                )}
                
                {product.keywords && product.keywords.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Keywords</h3>
                    <Separator className="my-2" />
                    <div className="flex flex-wrap gap-2">
                      {product.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {product.imageUrl ? (
                  <div className="border rounded-lg overflow-hidden p-4 flex items-center justify-center h-80">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden p-4 flex items-center justify-center h-80 bg-muted">
                    <div className="text-center text-muted-foreground">
                      <Package className="h-16 w-16 mx-auto mb-2 opacity-30" />
                      <p>No product image available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full gap-2" 
                onClick={() => navigate("/grn")}
              >
                <Truck className="h-4 w-4" />
                Add to GRN
              </Button>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => navigate(`/edit-product/${product.id}`)}
              >
                <Edit className="h-4 w-4" />
                Edit Product
              </Button>
              <Button 
                variant="secondary" 
                className="w-full gap-2"
                onClick={() => navigate("/checkout")}
              >
                <ShoppingBag className="h-4 w-4" />
                Add to Sale
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sales Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Revenue Potential</h3>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  ${(product.stock * product.sellingPrice).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Based on current stock and selling price
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Profit Potential</h3>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  ${(product.stock * (product.sellingPrice - product.costPrice)).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Based on current stock and profit margin
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
