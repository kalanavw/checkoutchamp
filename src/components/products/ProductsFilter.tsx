
import { ListFilter } from "lucide-react";
import { SearchBar } from "@/components/products/SearchBar";

interface ProductsFilterProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
}

export const ProductsFilter = ({ 
  searchQuery, 
  onSearch, 
  filter, 
  onFilterChange 
}: ProductsFilterProps) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <SearchBar value={searchQuery} onChange={onSearch} />
      </div>
      <div className="flex items-center gap-2">
        <ListFilter className="h-4 w-4 text-green-600 dark:text-green-400" />
        <select
          className="border rounded p-2 bg-background border-green-300 dark:border-green-700 text-green-800 dark:text-green-300"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Food">Food</option>
          <option value="Accessories">Accessories</option>
        </select>
      </div>
    </div>
  );
};
