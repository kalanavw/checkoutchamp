
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductsHeaderProps {
  loading: boolean;
  onRefresh: () => void;
}

export const ProductsHeader = ({ loading, onRefresh }: ProductsHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
      <h1 className="text-3xl font-bold text-green-700 dark:text-green-300">Products</h1>
      <div className="flex gap-2">
        <Button onClick={() => navigate("/add-product")} className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
        <Button 
          variant="outline" 
          onClick={onRefresh} 
          className="border-green-300 hover:bg-green-100 dark:border-green-700 dark:hover:bg-green-800/50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
};
