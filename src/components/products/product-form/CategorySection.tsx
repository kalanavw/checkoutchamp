
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
    location: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  locations: {id: string, name: string}[];
  onAddLocation: () => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ 
  formData, 
  handleChange,
  handleSelectChange,
  locations,
  onAddLocation
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

    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="location">Location</Label>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={onAddLocation}
          className="h-6 px-2 text-xs text-green-600"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add New
        </Button>
      </div>
      <Select
        value={formData.location}
        onValueChange={(value) => handleSelectChange("location", value)}
      >
        <SelectTrigger id="location">
          <SelectValue placeholder="Select location" />
        </SelectTrigger>
        <SelectContent>
          {locations.map(loc => (
            <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);
