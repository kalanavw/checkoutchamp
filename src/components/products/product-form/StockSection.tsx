
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface StockSectionProps {
  formData: {
    keywords: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const StockSection: React.FC<StockSectionProps> = ({ 
  formData, 
  handleChange 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
