
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductMetadata } from "@/hooks/products/useProductMetadata";

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
}) => {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [subcategoryOpen, setSubcategoryOpen] = useState(false);
  const { categories, subcategories } = useProductMetadata(false);
  
  // Filtered subcategories based on selected category
  const relevantSubcategories = subcategories.filter(sub => 
    !formData.category || // Show all if no category selected
    subcategories.some(s => s.toLowerCase().includes(formData.category.toLowerCase())) // Or if related to category
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Input
                id="category"
                name="category"
                placeholder="Enter category"
                value={formData.category}
                onChange={(e) => {
                  handleChange(e);
                  setCategoryOpen(true);
                }}
                className="w-full"
                autoComplete="off"
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search categories..." />
              <CommandList>
                <CommandEmpty>No category found.</CommandEmpty>
                <CommandGroup>
                  {categories
                    .filter(category => 
                      category.toLowerCase().includes(formData.category.toLowerCase())
                    )
                    .map(category => (
                      <CommandItem
                        key={category}
                        value={category}
                        onSelect={() => {
                          handleSelectChange("category", category);
                          setCategoryOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.category === category ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {category}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subcategory">Subcategory</Label>
        <Popover open={subcategoryOpen} onOpenChange={setSubcategoryOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Input
                id="subcategory"
                name="subcategory"
                placeholder="Enter subcategory"
                value={formData.subcategory}
                onChange={(e) => {
                  handleChange(e);
                  setSubcategoryOpen(true);
                }}
                className="w-full"
                autoComplete="off"
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search subcategories..." />
              <CommandList>
                <CommandEmpty>No subcategory found.</CommandEmpty>
                <CommandGroup>
                  {relevantSubcategories
                    .filter(subcategory => 
                      subcategory.toLowerCase().includes(formData.subcategory.toLowerCase())
                    )
                    .map(subcategory => (
                      <CommandItem
                        key={subcategory}
                        value={subcategory}
                        onSelect={() => {
                          handleSelectChange("subcategory", subcategory);
                          setSubcategoryOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.subcategory === subcategory ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {subcategory}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
