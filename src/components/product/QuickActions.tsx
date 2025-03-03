
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
          onClick={() => navigate(`/edit-product/${productId}`)}
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
  );
};
