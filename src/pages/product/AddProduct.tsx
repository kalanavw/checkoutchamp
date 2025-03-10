import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Package} from "lucide-react";
import {ProductForm} from "@/components/products/ProductForm.tsx";

const AddProduct = () => {
  return (
    <div className="container p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Package className="mr-2 h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Add New Product</h1>
      </div>

      <Card className="bg-secondary/30 border-theme-light">
        <CardHeader className="bg-gradient-to-r from-secondary to-secondary/50 rounded-t-lg">
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProduct;
