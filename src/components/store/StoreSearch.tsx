import React from 'react';
import {FilterX, PackageSearch} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';

interface StoreSearchProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    resetSearch: () => void;
}

const StoreSearch: React.FC<StoreSearchProps> = ({
                                                     searchTerm,
                                                     setSearchTerm,
                                                     resetSearch
                                                 }) => {
    return (
        <div className="relative flex-1 mb-6">
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
    );
};

export default StoreSearch;