
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PricingSectionProps {
  formData: {
    costPrice: string;
    sellingPrice: string;
    discount: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ 
  formData, 
  handleChange 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="space-y-2">
      <Label htmlFor="costPrice">
        Cost Price <span className="text-red-500">*</span>
      </Label>
      <Input
        id="costPrice"
        name="costPrice"
        type="number"
        min="0"
        step="0.01"
        placeholder="Enter cost price"
        value={formData.costPrice}
        onChange={handleChange}
        required
        className="border-primary/30 focus:border-primary"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="sellingPrice">
        Selling Price <span className="text-red-500">*</span>
      </Label>
      <Input
        id="sellingPrice"
        name="sellingPrice"
        type="number"
        min="0"
        step="0.01"
        placeholder="Enter selling price"
        value={formData.sellingPrice}
        onChange={handleChange}
        required
        className="border-primary/30 focus:border-primary"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="discount">Discount (%)</Label>
      <Input
        id="discount"
        name="discount"
        type="number"
        min="0"
        max="100"
        step="0.1"
        placeholder="Enter discount percentage"
        value={formData.discount}
        onChange={handleChange}
        className="border-primary/30 focus:border-primary"
      />
    </div>
  </div>
);
