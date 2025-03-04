
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { db, PRODUCT_COLLECTION } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Package, Save } from "lucide-react";
import { 
  BasicInfoSection, 
  PricingSection, 
  ImageSection, 
  CategorySection, 
  StockSection 
} from "@/components/products/product-form/form-sections";
import { optimizeImageToBase64 } from "@/utils/imageUtils";
import { saveToCache } from "@/utils/cacheUtils";

// Cache key prefix for products
const PRODUCTS_CACHE_KEY = "products_cache";

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    costPrice: "",
    sellingPrice: "",
    stock: "0",
    category: "",
    subcategory: "",
    location: "loc-1",
    keywords: "",
    barcode: "",
    discount: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.costPrice || !formData.sellingPrice) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (name, cost price, selling price).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;
      
      // Convert image to base64 if one is selected
      if (productImage) {
        try {
          // Optimize and convert to base64
          imageUrl = await optimizeImageToBase64(productImage);
        } catch (error) {
          console.error("Error converting image to base64:", error);
          toast({
            title: "Warning",
            description: "Failed to process image. Proceeding without image.",
          });
        }
      }
      
      // Format keywords
      const keywordsArray = formData.keywords
        .toLowerCase()
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
      
      const productData = {
        name: formData.name,
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        stock: parseInt(formData.stock),
        category: formData.category,
        subcategory: formData.subcategory,
        location: formData.location,
        keywords: keywordsArray,
        discount: formData.discount ? parseFloat(formData.discount) : 0,
        barcode: formData.barcode || null,
        imageUrl: imageUrl || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      // Add product to Firestore
      const docRef = await addDoc(collection(db, PRODUCT_COLLECTION), productData);
      
      // Add to cache with ID
      const productWithId = {
        ...productData,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Update the products list cache to indicate it needs refreshing
      saveToCache(`${PRODUCTS_CACHE_KEY}_lastUpdate`, { timestamp: Date.now() }, Date.now());
      
      // Cache the individual product
      saveToCache(`${PRODUCTS_CACHE_KEY}_${docRef.id}`, productWithId, Date.now());

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
          <form onSubmit={handleSubmit} className="space-y-6">
            <BasicInfoSection formData={formData} handleChange={handleChange} />
            <CategorySection
                formData={formData}
                handleChange={handleChange}
                handleSelectChange={handleSelectChange}
            />
            <PricingSection formData={formData} handleChange={handleChange} />
            <ImageSection
              imagePreview={imagePreview} 
              setImagePreview={setImagePreview} 
              setProductImage={setProductImage}
              uploadType="base64"
            />
            <StockSection formData={formData} handleChange={handleChange} />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/products")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/80">
                {loading ? (
                  <>
                    <span className="mr-2">Saving...</span>
                    <span className="animate-spin">⌛</span>
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Product
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProduct;
