
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db, PRODUCT_COLLECTION } from "@/lib/firebase";
import { Save, Plus } from "lucide-react";
import { 
  BasicInfoSection, 
  PricingSection, 
  ImageSection, 
  CategorySection, 
  StockSection 
} from "@/components/products/product-form/form-sections";
import { optimizeImageToBase64 } from "@/utils/imageUtils";
import { saveToCache } from "@/utils/cacheUtils";
import { COLLECTION_KEYS, saveCollectionUpdateTime } from "@/utils/collectionUtils";
import { Location } from "@/types/product";
import { Notifications } from "@/utils/notifications";
import { LocationDialog } from "./LocationDialog";

// Cache key prefix for products
const PRODUCTS_CACHE_KEY = "products_cache";
const LOCATIONS_COLLECTION = "locations";

export const ProductForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [saving, setSaving] = useState<"save" | "saveAndNew" | null>(null);
  
  const [formData, setFormData] = useState({
    productCode: "",
    name: "",
    costPrice: "",
    sellingPrice: "",
    stock: "0",
    category: "",
    subcategory: "",
    location: "",
    keywords: "",
    barcode: "",
    discount: "",
  });

  // Fetch locations
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const locationsCollection = collection(db, LOCATIONS_COLLECTION);
      const locationsSnapshot = await getDocs(locationsCollection);
      
      const locationsList: Location[] = [];
      locationsSnapshot.forEach((doc) => {
        const data = doc.data();
        locationsList.push({
          id: doc.id,
          name: data.name || "",
          code: data.code || "",
          description: data.description || "",
        });
      });
      
      setLocations(locationsList);
      
      // Set default location if available
      if (locationsList.length > 0 && !formData.location) {
        setFormData(prev => ({ ...prev, location: locationsList[0].id }));
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      Notifications.error("Failed to load locations");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = async () => {
    if (!formData.productCode || !formData.name || !formData.costPrice || !formData.sellingPrice) {
      Notifications.error("Please fill in all required fields (product code, name, cost price, selling price).");
      return false;
    }
    
    // Check if product code is unique
    try {
      const productsRef = collection(db, PRODUCT_COLLECTION);
      const q = query(productsRef, where("productCode", "==", formData.productCode));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        Notifications.error("Product code already exists. Please use a unique product code.");
        return false;
      }
    } catch (error) {
      console.error("Error checking product code uniqueness:", error);
      Notifications.error("Failed to verify product code uniqueness");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!(await validateForm())) {
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;
      
      if (productImage) {
        try {
          // Optimize image and convert to base64
          imageUrl = await optimizeImageToBase64(productImage);
        } catch (error) {
          console.error("Error converting image to base64:", error);
          Notifications.warning("Failed to process image. Proceeding without image.");
        }
      }
      
      const keywordsArray = formData.keywords
        .toLowerCase()
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
      
      const userName = localStorage.getItem("userName") || "Unknown";
      
      const productData = {
        productCode: formData.productCode,
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
        createdBy: userName,
        modifiedDate: serverTimestamp(),
        modifiedBy: userName,
      };
      
      const docRef = await addDoc(collection(db, PRODUCT_COLLECTION), productData);
      
      const productWithId = {
        ...productData,
        id: docRef.id,
        createdAt: new Date(),
        modifiedDate: new Date(),
        createdBy: userName,
        modifiedBy: userName
      };
      
      // Update the collection's last update timestamp
      saveCollectionUpdateTime(COLLECTION_KEYS.PRODUCTS);
      
      // Cache the individual product
      saveToCache(`${PRODUCTS_CACHE_KEY}_${docRef.id}`, productWithId, Date.now());

      Notifications.success("Product added successfully.");

      // Handle navigation based on button clicked
      if (saving === "saveAndNew") {
        // Reset form for a new product
        setFormData({
          productCode: "",
          name: "",
          costPrice: "",
          sellingPrice: "",
          stock: "0",
          category: formData.category, // Keep the same category
          subcategory: formData.subcategory, // Keep the same subcategory
          location: formData.location, // Keep the same location
          keywords: "",
          barcode: "",
          discount: "",
        });
        setProductImage(null);
        setImagePreview(null);
      } else {
        // Navigate back to products list
        navigate("/products");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      Notifications.error("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
      setSaving(null);
    }
  };

  const handleLocationAdded = (newLocation: Location) => {
    setLocations(prev => [...prev, newLocation]);
    setFormData(prev => ({ ...prev, location: newLocation.id }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BasicInfoSection formData={formData} handleChange={handleChange} />
      <CategorySection
          formData={formData}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          locations={locations}
          onAddLocation={() => setLocationDialogOpen(true)}
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
        <Button 
          type="button" 
          onClick={() => {
            setSaving("saveAndNew");
            handleSubmit(new Event('submit') as any);
          }} 
          disabled={loading} 
          variant="outline" 
          className="border-primary text-primary hover:bg-primary/10"
        >
          {loading && saving === "saveAndNew" ? (
            <>
              <span className="mr-2">Saving...</span>
              <span className="animate-spin">⌛</span>
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Save &amp; New
            </>
          )}
        </Button>
        <Button 
          type="submit" 
          onClick={() => setSaving("save")} 
          disabled={loading} 
          className="bg-primary hover:bg-primary/80"
        >
          {loading && saving === "save" ? (
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
      
      <LocationDialog 
        open={locationDialogOpen} 
        onOpenChange={setLocationDialogOpen}
        onLocationAdded={handleLocationAdded}
      />
    </form>
  );
};
