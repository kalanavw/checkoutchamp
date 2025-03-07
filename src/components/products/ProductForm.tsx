import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import {db, PRODUCT_COLLECTION} from "@/lib/firebase";
import { Save, Plus } from "lucide-react";
import { 
  BasicInfoSection,
  ImageSection, 
  CategorySection, 
  StockSection 
} from "@/components/products/product-form";
import { optimizeImageToBase64 } from "@/utils/imageUtils";
import { saveToCache } from "@/utils/cacheUtils";
import { COLLECTION_KEYS, saveCollectionUpdateTime } from "@/utils/collectionUtils";
import { Notifications } from "@/utils/notifications";

// Cache key prefix for products
const PRODUCTS_CACHE_KEY = "products_cache";

export const ProductForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState<"save" | "saveAndNew" | null>(null);
  
  const [formData, setFormData] = useState({
    productCode: "",
    name: "",
    category: "",
    subcategory: "",
    keywords: "",
    barcode: ""
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

  const validateForm = async () => {
    if (!formData.productCode || !formData.name) {
      Notifications.error("Please fill in all required fields (product code, name, barcode, category, subcategory, keywords).");
      return false;
    }
    
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
        category: formData.category,
        subcategory: formData.subcategory,
        keywords: keywordsArray,
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
      
      saveCollectionUpdateTime(COLLECTION_KEYS.PRODUCTS);

      saveToCache(`${PRODUCTS_CACHE_KEY}_${docRef.id}`, productWithId, Date.now());

      Notifications.success("Product added successfully.");

      if (saving === "saveAndNew") {
        setFormData({
          productCode: "",
          name: "",
          category: formData.category,
          subcategory: formData.subcategory,
          keywords: "",
          barcode: "",
        });
        setProductImage(null);
        setImagePreview(null);
        navigate("/add-product")
      } else {
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


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BasicInfoSection formData={formData} handleChange={handleChange} />
      <CategorySection
          formData={formData}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
      />
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
            handleSubmit(new Event('submit') as any).then(r => {
              setFormData({
                productCode: "",
                name: "",
                category: formData.category,
                subcategory: formData.subcategory,
                keywords: "",
                barcode: "",
              });
              navigate("/add-product")
            });
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
    </form>
  );
};
