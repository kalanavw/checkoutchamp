
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building, Save, FileImage } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StoreInfo } from "@/types/storeInfo";

interface StoreInfoCardProps {
  storeInfo: StoreInfo;
  logoPreview: string | null;
  loading: boolean;
  onInputChange: (field: keyof StoreInfo, value: string) => void;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveLogo: () => void;
  onSave: () => Promise<void>;
}

const StoreInfoCard = ({
  storeInfo,
  logoPreview,
  loading,
  onInputChange,
  onLogoChange,
  onRemoveLogo,
  onSave
}: StoreInfoCardProps) => {
  return (
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
            onClick={onSave} 
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
                onChange={onLogoChange}
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
                  onClick={onRemoveLogo}
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
              onChange={(e) => onInputChange("businessName", e.target.value)}
              placeholder="Enter business name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registeredName">Registered Name</Label>
            <Input
              id="registeredName"
              value={storeInfo.registeredName}
              onChange={(e) => onInputChange("registeredName", e.target.value)}
              placeholder="Enter registered name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="registrationId">Registration ID</Label>
          <Input
            id="registrationId"
            value={storeInfo.registrationId}
            onChange={(e) => onInputChange("registrationId", e.target.value)}
            placeholder="Enter business registration ID"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={storeInfo.email}
            onChange={(e) => onInputChange("email", e.target.value)}
            placeholder="Enter email"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={storeInfo.phone}
            onChange={(e) => onInputChange("phone", e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={storeInfo.address}
            onChange={(e) => onInputChange("address", e.target.value)}
            placeholder="Enter store address"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreInfoCard;
