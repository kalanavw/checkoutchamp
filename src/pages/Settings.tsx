
import { useEffect } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { useGoogleDrive } from "@/lib/googleDriveService";
import StoreInfoCard from "@/components/settings/StoreInfoCard";
import SystemPreferencesCard from "@/components/settings/SystemPreferencesCard";
import { useStoreInfo } from "@/hooks/useStoreInfo";

const Settings = () => {
  const { 
    storeInfo,
    logoPreview,
    loading,
    handleInputChange,
    handleLogoChange,
    handleRemoveLogo,
    handleSaveStoreInfo
  } = useStoreInfo();

  // Initialize Google Drive
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

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <SettingsIcon className="h-6 w-6 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StoreInfoCard
          storeInfo={storeInfo}
          logoPreview={logoPreview}
          loading={loading}
          onInputChange={handleInputChange}
          onLogoChange={handleLogoChange}
          onRemoveLogo={handleRemoveLogo}
          onSave={handleSaveStoreInfo}
        />
        <SystemPreferencesCard />
      </div>
    </div>
  );
};

export default Settings;
