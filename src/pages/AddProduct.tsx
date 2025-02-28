
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, X, ArrowLeft } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";

interface ProductForm {
  name: string;
  category: string;
  subcategory: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  location: "loc-1" | "loc-2";
  keywords: string[];
  discount?: number;
  grnNumber?: string;
  barcode?: string;
}

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");
  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    category: "General",
    subcategory: "",
    costPrice: 0,
    sellingPrice: 0,
    stock: 0,
    location: "loc-1",
    keywords: [],
    discount: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "products"), formData);
      toast({
        title: "Success",
        description: "Product added successfully.",
      });
      navigate("/products");
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProductForm, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      handleChange("keywords", [...formData.keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    handleChange("keywords", formData.keywords.filter(k => k !== keyword));
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate("/products")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold text-green-800 dark:text-green-300">Add New Product</h1>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate("/products")}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading} 
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? "Adding..." : "Save Product"}
          </Button>
        </div>
      </div>
      
      <Card className="shadow-lg flex-1 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-t-lg px-6">
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300">
            <Plus className="h-5 w-5" />
            Product Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 overflow-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name*</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter product name"
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode (Optional)</Label>
                <Input
                  id="barcode"
                  value={formData.barcode || ""}
                  onChange={(e) => handleChange("barcode", e.target.value)}
                  placeholder="Enter barcode"
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category*</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  placeholder="Enter category"
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => handleChange("subcategory", e.target.value)}
                  placeholder="Enter subcategory"
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Storage Location*</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => handleChange("location", value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loc-1">Location 1</SelectItem>
                    <SelectItem value="loc-2">Location 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price*</Label>
                <Input
                  id="costPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => handleChange("costPrice", parseFloat(e.target.value))}
                  placeholder="Enter cost price"
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price*</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) => handleChange("sellingPrice", parseFloat(e.target.value))}
                  placeholder="Enter selling price"
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount || 0}
                  onChange={(e) => handleChange("discount", parseFloat(e.target.value))}
                  placeholder="Enter discount"
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stock">Initial Stock*</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleChange("stock", parseInt(e.target.value))}
                  placeholder="Enter stock quantity"
                  required
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grnNumber">GRN Number (Optional)</Label>
              <Input
                id="grnNumber"
                value={formData.grnNumber || ""}
                onChange={(e) => handleChange("grnNumber", e.target.value)}
                placeholder="Enter GRN number"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <div className="flex gap-2">
                <Input
                  id="keywords"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Enter keywords for search"
                  className="h-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                />
                <Button type="button" onClick={addKeyword} className="h-10">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1 flex items-center gap-1">
                    {keyword}
                    <button type="button" onClick={() => removeKeyword(keyword)} className="ml-1 text-xs">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProduct;
