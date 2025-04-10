
import { useState, useEffect } from "react";
import { StoreService } from "@/services/StoreService";
import { Store } from "@/types/store";
import { getFromCache, saveToCache } from "@/utils/cacheUtils";
import { STORE_CACHE_KEY } from "@/constants/cacheKeys"; 

export const useStoreData = (forceRefresh: boolean = false) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      // Try getting from cache first
      const cachedStores = getFromCache<Store[]>(STORE_CACHE_KEY);
      
      if (!forceRefresh && cachedStores) {
        setStores(cachedStores);
        setLoading(false);
        return;
      }
      
      const storeService = new StoreService();
      const fetchedStores = await storeService.findAll();
      
      setStores(fetchedStores);
      
      // Save to cache
      saveToCache(STORE_CACHE_KEY, fetchedStores);
      
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [forceRefresh]);

  return { stores, loading, refreshStores: fetchStores };
};
