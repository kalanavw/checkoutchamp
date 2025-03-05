
import { Edit, ShoppingBag, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickActionsProps {
  productId: string;
}

export const QuickActions = ({ productId }: QuickActionsProps) => {
  const navigate = useNavigate();

  return (
    <Card className="bg-green-50/50 dark:bg-green-900/30 border-green-100 dark:border-green-800/50">
      <CardHeader className="bg-gradient-to-r from-green-100 to-green-50/50 dark:from-green-800/50 dark:to-green-900/30 rounded-t-lg">
        <CardTitle className="text-lg text-green-800 dark:text-green-300">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          className="w-full gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600" 
          onClick={() => navigate("/grn")}
        >
          <Truck className="h-4 w-4" />
          Add to GRN
        </Button>
        <Button 
          variant="outline" 
          className="w-full gap-2 border-green-200 text-green-700 hover:bg-green-100/50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-800/50"
          onClick={() => navigate(`/edit-product/${productId}`)}
        >
          <Edit className="h-4 w-4" />
          Edit Product
        </Button>
        <Button 
          variant="secondary" 
          className="w-full gap-2 bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800/30 dark:text-green-300 dark:hover:bg-green-700/50"
          onClick={() => navigate("/checkout")}
        >
          <ShoppingBag className="h-4 w-4" />
          Add to Sale
        </Button>
      </CardContent>
    </Card>
  );
};
