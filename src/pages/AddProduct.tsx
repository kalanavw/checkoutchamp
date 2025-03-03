
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {db, PRODUCT_COLLECTION} from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Package, Save } from "lucide-react";
import { 
  BasicInfoSection, 
  PricingSection, 
  ImageSection, 
  CategorySection, 
  StockSection 
} from "@/components/products/product-form/form-sections";
import { useGoogleDrive } from "@/lib/googleDriveService";

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { uploadImage } = useGoogleDrive();
  
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

  // Initialize Google Drive on component mount
  useEffect(() => {
    const initDrive = async () => {
      try {
        const driveService = useGoogleDrive();
        await driveService.initialize();
      } catch (error) {
        console.error("Failed to initialize Google Drive", error);
      }
    };
    
    initDrive();
  }, []);

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
      let imageUrl = undefined;
      
      // Upload image to Google Drive if one is selected
      if (productImage) {
        try {
          imageUrl = await uploadImage(productImage, 'product');
          
          if (!imageUrl) {
            toast({
              title: "Warning",
              description: "Failed to upload image to Google Drive. Proceeding without image.",
            });
          }
        } catch (error) {
          console.error("Error uploading to Google Drive:", error);
          toast({
            title: "Warning",
            description: "Failed to upload image. Proceeding without image.",
          });
        }
      }
      
      // Format keywords
      const keywordsArray = formData.keywords
        .toLowerCase()
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
      
      // Add product to Firestore
      await addDoc(collection(db, PRODUCT_COLLECTION), {
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
      });

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

      <Card>
        <CardHeader>
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
              uploadType="google-drive"
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
              <Button type="submit" disabled={loading}>
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
