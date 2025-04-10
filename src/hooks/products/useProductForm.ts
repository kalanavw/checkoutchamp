
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, PRODUCT_COLLECTION } from "@/lib/firebase";
import { optimizeImageToBase64 } from "@/utils/imageUtils";
import { saveToCache } from "@/utils/cacheUtils";
import { COLLECTION_KEYS, saveCollectionUpdateTime } from "@/utils/collectionUtils";
import { Notifications } from "@/utils/notifications";
import { Product } from "@/types/product";
import { generateCustomUUID } from "@/utils/Util";
import { PRODUCTS_CACHE_KEY } from "@/constants/cacheKeys";
import { productService } from "@/services/ProductService";

export interface ProductFormData {
  productCode: string;
  name: string;
  category: string;
  subcategory: string;
  keywords: string;
  barcode: string;
}

export const useProductForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState<"save" | "saveAndNew" | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
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
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({...prev, [name]: value}));
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

      const productData: Product = {
        id: generateCustomUUID(),
        productCode: formData.productCode,
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory,
        keywords: keywordsArray,
        barcode: formData.barcode || null,
        imageUrl: imageUrl || null,
        createdAt: new Date(),
        createdBy: userName,
        modifiedDate: new Date(),
        modifiedBy: userName,
      };

      const productWithId = await productService.createProduct(productData);

      saveCollectionUpdateTime(COLLECTION_KEYS.PRODUCTS);

      saveToCache(`${PRODUCTS_CACHE_KEY}_${productWithId.id}`, productWithId, Date.now());

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
        navigate("/add-product");
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

  return {
    formData,
    setFormData,
    loading,
    productImage,
    setProductImage,
    imagePreview,
    setImagePreview,
    saving,
    setSaving,
    handleChange,
    handleSelectChange,
    handleSubmit
  };
};
