
import { useState } from "react";
import { productService } from "@/services/ProductService";
import { doc, updateDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db, PRODUCT_COLLECTION } from "@/lib/firebase";
import { Product } from "@/types/product";
import { COLLECTION_KEYS, saveCollectionUpdateTime } from "@/utils/collectionUtils";
import { Notifications } from "@/utils/notifications";

export const useProductOperations = (
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  const [loading, setLoading] = useState(false);

  const deleteProduct = async (id: string) => {
    try {
      setLoading(true);
      const userName = localStorage.getItem("userName") || "Unknown";
      
      // First update the modified date to track when the product was deleted
      await updateDoc(doc(db, PRODUCT_COLLECTION, id), {
        modifiedDate: serverTimestamp(),
        modifiedBy: userName
      });
      
      // Then delete the document
      await deleteDoc(doc(db, PRODUCT_COLLECTION, id));
      
      // Update the cache in ProductService
      await productService.deleteProduct(id);
      
      // Update the local state
      setAllProducts(prev => prev.filter(p => p.id !== id));
      
      saveCollectionUpdateTime(COLLECTION_KEYS.PRODUCTS);
      
      Notifications.success("Product deleted successfully.");
    } catch (error) {
      console.error("Error deleting product:", error);
      Notifications.error("Failed to delete product.");
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = async () => {
    try {
      setLoading(true);
      const allProductsData = await productService.getAllProducts(true); // Force refresh
      setAllProducts(allProductsData);
      return allProductsData;
    } catch (error) {
      console.error("Error refreshing products:", error);
      Notifications.error("Failed to refresh products.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    deleteProduct,
    refreshProducts,
  };
};
