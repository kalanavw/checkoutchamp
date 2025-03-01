
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
}

export const SearchBar = ({ value, onChange, onSearch }: SearchBarProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // If onSearch is provided, call it (for backward compatibility)
    if (onSearch) {
      onSearch(newValue);
    }
  };

  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
      <Input
        placeholder="Search products..."
        value={value}
        onChange={handleChange}
        className="pl-10"
      />
    </div>
  );
};
