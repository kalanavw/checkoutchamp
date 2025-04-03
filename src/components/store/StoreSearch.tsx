
import React from 'react';
import {FilterX, PackageSearch} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Label} from '@/components/ui/label';

interface StoreSearchProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    resetSearch: () => void;
    categoryFilter: string;
    setCategoryFilter: (value: string) => void;
    subcategoryFilter: string;
    setSubcategoryFilter: (value: string) => void;
    categories: string[];
    subcategories: string[];
}

const StoreSearch: React.FC<StoreSearchProps> = ({
    searchTerm,
    setSearchTerm,
    resetSearch,
    categoryFilter,
    setCategoryFilter,
    subcategoryFilter,
    setSubcategoryFilter,
    categories,
    subcategories
}) => {
    return (
        <div className="space-y-4 w-full">
            <div className="relative">
                <PackageSearch
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={18}
                />
                <Input
                    placeholder="Search by product name, code, barcode, GRN number, or location..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2"
                        onClick={resetSearch}
                    >
                        <FilterX size={18}/>
                    </Button>
                )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-1">
                    <Label htmlFor="category-filter" className="text-sm font-medium">
                        Category
                    </Label>
                    <Select
                        value={categoryFilter}
                        onValueChange={setCategoryFilter}
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
                        onValueChange={setSubcategoryFilter}
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

export default StoreSearch;
