
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageIcon, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DialogTrigger } from "@/components/ui/dialog";

// Price and Discount Section
export const PricingSection = ({ 
  formData, 
  handleChange 
}: { 
  formData: {
    costPrice: string;
    sellingPrice: string;
    discount: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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

// Product Basic Info Section
export const BasicInfoSection = ({ 
  formData, 
  handleChange 
}: { 
  formData: {
    productCode: string;
    name: string;
    barcode: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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

// Category and Location Section
export const CategorySection = ({ 
  formData, 
  handleChange,
  handleSelectChange,
  locations,
  onAddLocation
}: { 
  formData: {
    category: string;
    subcategory: string;
    location: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  locations: {id: string, name: string}[];
  onAddLocation: () => void;
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
        <DialogTrigger asChild>
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
        </DialogTrigger>
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

// Stock and Keywords Section
export const StockSection = ({ 
  formData, 
  handleChange 
}: { 
  formData: {
    stock: string;
    keywords: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-2">
      <Label htmlFor="stock">Initial Stock</Label>
      <Input
        id="stock"
        name="stock"
        type="number"
        min="0"
        placeholder="Enter initial stock"
        value={formData.stock}
        onChange={handleChange}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="keywords">Keywords (comma separated)</Label>
      <Textarea
        id="keywords"
        name="keywords"
        placeholder="Enter keywords separated by commas"
        value={formData.keywords}
        onChange={handleChange}
      />
    </div>
  </div>
);

// Image Upload Section
export const ImageSection = ({ 
  imagePreview, 
  setImagePreview, 
  setProductImage,
  uploadType = "base64" 
}: { 
  imagePreview: string | null;
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
  setProductImage: React.Dispatch<React.SetStateAction<File | null>>;
  uploadType?: "firebase" | "google-drive" | "base64";
}) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProductImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="productImage">
        Product Image 
        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
          JPEG Base64
        </Badge>
      </Label>
      <div className="flex flex-col space-y-2">
        {imagePreview && (
          <div className="p-2 border rounded-md w-40 h-40 flex items-center justify-center mb-2 border-primary/30">
            <img 
              src={imagePreview} 
              alt="Product preview" 
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Input
            id="productImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <Button 
            type="button" 
            variant="outline"
            onClick={() => document.getElementById('productImage')?.click()}
            className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
          >
            <ImageIcon className="h-4 w-4" />
            {imagePreview ? "Change Image" : "Upload Image"}
          </Button>
          {imagePreview && (
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setImagePreview(null);
                setProductImage(null);
              }}
              className="text-red-500 hover:text-red-600 border-red-300"
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
