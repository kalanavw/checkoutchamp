import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Save, FileImage } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {db, STOREINFO_COLLECTION} from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { StoreInfo } from "@/types/storeInfo";
import { useGoogleDrive } from "@/lib/googleDriveService";
import { Badge } from "@/components/ui/badge";

const Settings = () => {
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

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <SettingsIcon className="h-6 w-6 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-green-700" />
                  Store Information
                </CardTitle>
                <CardDescription>Manage your store details and contact information</CardDescription>
              </div>
              <Button 
                onClick={handleSaveStoreInfo} 
                className="bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </div>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="logo" className="flex items-center">
                Business Logo
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                  Google Drive
                </Badge>
              </Label>
              <div className="flex flex-col gap-4">
                {logoPreview && (
                  <div className="border p-2 rounded-md w-40 h-40 flex items-center justify-center">
                    <img 
                      src={logoPreview} 
                      alt="Business Logo" 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    id="logo"
                    type="file"
                    onChange={handleLogoChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => document.getElementById('logo')?.click()}
                    className="gap-2"
                  >
                    <FileImage className="h-4 w-4" />
                    {logoPreview ? "Change Logo" : "Upload Logo"}
                  </Button>
                  {logoPreview && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setLogoPreview(null);
                        setLogoFile(null);
                        setStoreInfo(prev => ({ ...prev, logoUrl: undefined }));
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Display Name</Label>
                <Input
                  id="businessName"
                  value={storeInfo.businessName}
                  onChange={(e) => handleInputChange("businessName", e.target.value)}
                  placeholder="Enter business name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registeredName">Registered Name</Label>
                <Input
                  id="registeredName"
                  value={storeInfo.registeredName}
                  onChange={(e) => handleInputChange("registeredName", e.target.value)}
                  placeholder="Enter registered name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationId">Registration ID</Label>
              <Input
                id="registrationId"
                value={storeInfo.registrationId}
                onChange={(e) => handleInputChange("registrationId", e.target.value)}
                placeholder="Enter business registration ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={storeInfo.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={storeInfo.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={storeInfo.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter store address"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Preferences</CardTitle>
            <CardDescription>Configure system-wide settings and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email alerts for new orders</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Updates</Label>
                <p className="text-sm text-muted-foreground">Keep the system up to date</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
