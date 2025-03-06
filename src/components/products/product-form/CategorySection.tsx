
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategorySectionProps {
  formData: {
    category: string;
    subcategory: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ 
  formData, 
  handleChange,
  handleSelectChange,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="space-y-2">
      <Label htmlFor="category">Category</Label>
      <Input
        id="category"
        name="category"
        placeholder="Enter category"
        value={formData.category}
        onChange={handleChange}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="subcategory">Subcategory</Label>
      <Input
        id="subcategory"
        name="subcategory"
        placeholder="Enter subcategory"
        value={formData.subcategory}
        onChange={handleChange}
      />
    </div>
  </div>
);
