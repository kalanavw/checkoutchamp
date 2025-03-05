import { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, updateDoc, query, orderBy, limit } from "firebase/firestore";
import { db, STOREINFO_COLLECTION } from "@/lib/firebase";
import { StoreInfo } from "@/types/storeInfo";
import { Notifications } from "@/utils/notifications";
import { optimizeImageToBase64 } from "@/utils/imageUtils";
import { isCacheValid, saveToCache, getFromCache, getLastModifiedTime } from "@/utils/cacheUtils";

// Cache key for store info
const STORE_INFO_CACHE_KEY = "store_info_cache";

export const useStoreInfo = () => {
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    businessName: "",
    registeredName: "",
    registrationId: "",
    email: "",
    phone: "",
    address: "",
  });

  // Load existing store info
  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        // Check localStorage first
        const localStoreInfo = localStorage.getItem("storeInfo");
        if (localStoreInfo) {
          try {
            const parsedInfo = JSON.parse(localStoreInfo);
            setStoreInfo(parsedInfo);
            if (parsedInfo.logoUrl) {
              setLogoPreview(parsedInfo.logoUrl);
            }
            console.log("Using localStorage store info");
            return;
          } catch (error) {
            console.error("Error parsing local store info:", error);
          }
        }
        
        // Check cache if localStorage failed
        const cachedData = getFromCache<StoreInfo & { id?: string }>(STORE_INFO_CACHE_KEY);
        const lastModified = getLastModifiedTime(STORE_INFO_CACHE_KEY);
        
        if (cachedData && isCacheValid(STORE_INFO_CACHE_KEY)) {
          setStoreInfo(cachedData);
          if (cachedData.logoUrl) {
            setLogoPreview(cachedData.logoUrl);
          }
          console.log("Using cached store info");
          return;
        }
        
        // Fetch from Firestore if cache is invalid
        const storeQuery = query(
          collection(db, STOREINFO_COLLECTION),
          orderBy("updatedAt", "desc"),
          limit(1)
        );
        
        const storeSnapshot = await getDocs(storeQuery);
        
        if (!storeSnapshot.empty) {
          const storeDoc = storeSnapshot.docs[0];
          const storeData = storeDoc.data() as StoreInfo & { updatedAt?: any };
          const updatedAtTimestamp = storeData.updatedAt?.toMillis() || Date.now();
          
          // If lastModified in cache is same or newer than server, use cache
          if (lastModified >= updatedAtTimestamp && cachedData) {
            setStoreInfo(cachedData);
            if (cachedData.logoUrl) {
              setLogoPreview(cachedData.logoUrl);
            }
            console.log("Using cached store info (server not newer)");
            return;
          }
          
          // Server has newer data, update cache
          const storeWithId = {
            ...storeData,
            id: storeDoc.id
          };
          
          setStoreInfo(storeWithId);
          if (storeWithId.logoUrl) {
            setLogoPreview(storeWithId.logoUrl);
          }
          
          // Save to cache with server's last modified time
          saveToCache(STORE_INFO_CACHE_KEY, storeWithId, updatedAtTimestamp);
          
          // Save to localStorage for app-wide access
          localStorage.setItem("storeInfo", JSON.stringify(storeWithId));
        }
      } catch (error) {
        console.error("Error fetching store info:", error);
        Notifications.error("Failed to load store information.");
        
        // If fetching fails but we have cache, use it regardless of age
        const cachedData = getFromCache<StoreInfo & { id?: string }>(STORE_INFO_CACHE_KEY);
        if (cachedData) {
          setStoreInfo(cachedData);
          if (cachedData.logoUrl) {
            setLogoPreview(cachedData.logoUrl);
          }
          console.log("Using cached store info after fetch error");
        }
      }
    };

    fetchStoreInfo();
  }, []);

  const handleInputChange = (field: keyof StoreInfo, value: string) => {
    setStoreInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    setStoreInfo(prev => ({ ...prev, logoUrl: undefined }));
  };

  const handleSaveStoreInfo = async () => {
    if (!storeInfo.businessName) {
      Notifications.error("Business name is required.");
      return;
    }

    setLoading(true);

    try {
      let logoUrl = storeInfo.logoUrl;

      // Convert logo to base64 if a new one is selected
      if (logoFile) {
        try {
          // Optimize and convert to base64
          logoUrl = await optimizeImageToBase64(logoFile);
        } catch (error) {
          console.error("Error converting logo to base64:", error);
          Notifications.warning("Failed to process logo. Using previous logo if available.");
        }
      }

      const updatedStoreInfo = {
        ...storeInfo,
        logoUrl,
        updatedAt: new Date()
      };

      // Save to Firestore
      if (storeInfo.id) {
        // Update existing document
        await updateDoc(doc(db, STOREINFO_COLLECTION, storeInfo.id), updatedStoreInfo);
      } else {
        // Create new document
        const newDocRef = doc(collection(db, STOREINFO_COLLECTION));
        await setDoc(newDocRef, updatedStoreInfo);
        updatedStoreInfo.id = newDocRef.id;
      }

      // Update local state
      setStoreInfo(updatedStoreInfo);
      
      // Update cache
      saveToCache(STORE_INFO_CACHE_KEY, updatedStoreInfo, Date.now());
      
      // Update localStorage (this will trigger an update in the Layout component)
      localStorage.setItem("storeInfo", JSON.stringify(updatedStoreInfo));
      
      // Additionally dispatch a storage event to ensure Layout component updates
      // (in case the settings page is the only tab open)
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'storeInfo',
        newValue: JSON.stringify(updatedStoreInfo)
      }));

      Notifications.success("Store information saved successfully.");
    } catch (error) {
      console.error("Error saving store information:", error);
      Notifications.error("Failed to save store information.");
    } finally {
      setLoading(false);
    }
  };

  return {
    storeInfo,
    logoPreview,
    loading,
    handleInputChange,
    handleLogoChange,
    handleRemoveLogo,
    handleSaveStoreInfo
  };
};
