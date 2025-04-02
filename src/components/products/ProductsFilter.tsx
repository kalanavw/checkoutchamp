
import {SearchBar} from "@/components/products/SearchBar";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Label} from "@/components/ui/label";

interface ProductsFilterProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  categoryFilter: string;
  subcategoryFilter: string;
  categories: string[];
  subcategories: string[];
  onCategoryChange: (filter: string) => void;
  onSubcategoryChange: (filter: string) => void;
  loading: boolean;
}

export const ProductsFilter = ({
  searchQuery, 
  onSearch, 
  categoryFilter, 
  subcategoryFilter,
  categories,
  subcategories,
  onCategoryChange,
  onSubcategoryChange,
  loading
}: ProductsFilterProps) => {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex-1">
        <SearchBar 
          value={searchQuery} 
          onChange={onSearch} 
          placeholder="Search by name, code, category, keywords..."
          disabled={loading}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-1">
          <Label htmlFor="category-filter" className="text-sm font-medium">
            Category
          </Label>
          <Select
            value={categoryFilter}
            onValueChange={onCategoryChange}
            disabled={loading}
          >
            <SelectTrigger id="category-filter" className="border-green-300 dark:border-green-700">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 space-y-1">
          <Label htmlFor="subcategory-filter" className="text-sm font-medium">
            Subcategory
          </Label>
          <Select
            value={subcategoryFilter}
            onValueChange={onSubcategoryChange}
            disabled={loading}
          >
            <SelectTrigger id="subcategory-filter" className="border-green-300 dark:border-green-700">
              <SelectValue placeholder="All Subcategories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subcategories</SelectItem>
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory} value={subcategory}>
                  {subcategory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
