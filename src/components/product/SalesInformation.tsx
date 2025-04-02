
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {Product} from "@/types/product";

interface SalesInformationProps {
  product: Product;
}

export const SalesInformation = ({ product }: SalesInformationProps) => {
  return (
    <Card className="bg-green-50/50 dark:bg-green-900/30 border-green-100 dark:border-green-800/50">
      <CardHeader className="bg-gradient-to-r from-green-100 to-green-50/50 dark:from-green-800/50 dark:to-green-900/30 rounded-t-lg">
        <CardTitle className="text-lg text-green-800 dark:text-green-300">Sales Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-green-700 dark:text-green-400">Revenue Potential</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            100
          </p>
          <p className="text-sm text-green-600/70 dark:text-green-500/70">
            Based on current stock and selling price
          </p>
        </div>
        <Separator className="bg-green-200 dark:bg-green-700/50" />
        <div>
          <h3 className="text-sm font-medium text-green-700 dark:text-green-400">Profit Potential</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            200
          </p>
          <p className="text-sm text-green-600/70 dark:text-green-500/70">
            Based on current stock and profit margin
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
