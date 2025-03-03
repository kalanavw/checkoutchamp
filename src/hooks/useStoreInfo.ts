
import { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { db, STOREINFO_COLLECTION } from "@/lib/firebase";
import { StoreInfo } from "@/types/storeInfo";
import { useToast } from "@/components/ui/use-toast";
import { useGoogleDrive } from "@/lib/googleDriveService";

export const useStoreInfo = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { uploadImage } = useGoogleDrive();
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
        const storeSnapshot = await getDocs(collection(db, STOREINFO_COLLECTION));
        if (!storeSnapshot.empty) {
          const storeData = storeSnapshot.docs[0].data() as StoreInfo;
          storeData.id = storeSnapshot.docs[0].id;
          setStoreInfo(storeData);
          if (storeData.logoUrl) {
            setLogoPreview(storeData.logoUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching store info:", error);
        toast({
          title: "Error",
          description: "Failed to load store information.",
          variant: "destructive",
        });
      }
    };

    fetchStoreInfo();
  }, [toast]);

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
      toast({
        title: "Error",
        description: "Business name is required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let logoUrl = storeInfo.logoUrl;

      // Upload logo to Google Drive if a new one is selected
      if (logoFile) {
        try {
          const businessId = storeInfo.id || 'new-business';
          const newLogoUrl = await uploadImage(logoFile, 'business', businessId);
          
          if (newLogoUrl) {
            logoUrl = newLogoUrl;
          } else {
            toast({
              title: "Warning",
              description: "Failed to upload logo to Google Drive. Using previous logo if available.",
            });
          }
        } catch (error) {
          console.error("Error uploading to Google Drive:", error);
          toast({
            title: "Warning",
            description: "Failed to upload logo. Using previous logo if available.",
          });
        }
      }

      const updatedStoreInfo = {
        ...storeInfo,
        logoUrl
      };

      // Save to Firestore
      if (storeInfo.id) {
        // Update existing document
        await updateDoc(doc(db, "storeInfo", storeInfo.id), updatedStoreInfo);
      } else {
        // Create new document
        await setDoc(doc(collection(db, "storeInfo")), updatedStoreInfo);
      }

      // Update local state
      setStoreInfo(updatedStoreInfo);

      toast({
        title: "Success",
        description: "Store information saved successfully.",
      });
    } catch (error) {
      console.error("Error saving store information:", error);
      toast({
        title: "Error",
        description: "Failed to save store information.",
        variant: "destructive",
      });
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
