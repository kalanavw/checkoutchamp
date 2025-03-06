
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BasicInfoSectionProps {
  formData: {
    productCode: string;
    name: string;
    barcode: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ 
  formData, 
  handleChange 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="space-y-2">
      <Label htmlFor="productCode">
        Product Code <span className="text-red-500">*</span>
      </Label>
      <Input
        id="productCode"
        name="productCode"
        placeholder="Enter product code"
        value={formData.productCode}
        onChange={handleChange}
        required
      />
    </div>

    <div className="space-y-2 md:col-span-2">
      <Label htmlFor="name">
        Product Name <span className="text-red-500">*</span>
      </Label>
      <Input
        id="name"
        name="name"
        placeholder="Enter product name"
        value={formData.name}
        onChange={handleChange}
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="barcode">Barcode</Label>
      <Input
        id="barcode"
        name="barcode"
        placeholder="Enter barcode (optional)"
        value={formData.barcode}
        onChange={handleChange}
      />
    </div>
  </div>
);
