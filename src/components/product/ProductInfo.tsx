
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Product } from "@/types/product";
import { MapPin, Barcode } from "lucide-react";

interface ProductInfoProps {
  product: Product;
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
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
    <div className="space-y-6">
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
    </div>
  );
};
