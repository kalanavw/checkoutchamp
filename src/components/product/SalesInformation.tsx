
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Product } from "@/types/product";

interface SalesInformationProps {
  product: Product;
}

export const SalesInformation = ({ product }: SalesInformationProps) => {
  return (
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
  );
};
