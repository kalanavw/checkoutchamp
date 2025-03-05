
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
        className="text-green-700 hover:bg-green-100/50 dark:text-green-300 dark:hover:bg-green-800/50"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-3xl font-bold flex items-center gap-2 text-green-800 dark:text-green-300">
        <Package className="h-7 w-7 text-green-600 dark:text-green-400" />
        Product Details
      </h1>
      <div className="ml-auto">
        <Button 
          onClick={() => navigate(`/edit-product/${productId}`)} 
          className="gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
        >
          <Edit className="h-4 w-4" />
          Edit Product
        </Button>
      </div>
    </div>
  );
};
