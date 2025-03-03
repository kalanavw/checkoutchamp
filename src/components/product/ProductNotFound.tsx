
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const ProductNotFound = () => {
  const navigate = useNavigate();

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
};
