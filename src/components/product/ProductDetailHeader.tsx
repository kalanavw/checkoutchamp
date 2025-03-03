
import { ArrowLeft, Edit, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ProductDetailHeaderProps {
  productId: string;
}

export const ProductDetailHeader = ({ productId }: ProductDetailHeaderProps) => {
  const navigate = useNavigate();

  return (
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
          onClick={() => navigate(`/edit-product/${productId}`)} 
          className="gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit Product
        </Button>
      </div>
    </div>
  );
};
