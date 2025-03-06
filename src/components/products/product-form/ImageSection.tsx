
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ImageSectionProps {
  imagePreview: string | null;
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
  setProductImage: React.Dispatch<React.SetStateAction<File | null>>;
  uploadType?: "firebase" | "google-drive" | "base64";
}

export const ImageSection: React.FC<ImageSectionProps> = ({ 
  imagePreview, 
  setImagePreview, 
  setProductImage,
  uploadType = "base64" 
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
