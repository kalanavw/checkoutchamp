import React from 'react';
import {PackagePlus} from 'lucide-react';
import {Link} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import StoreSearch from '@/components/store/StoreSearch';
import StoreTable from '@/components/store/StoreTable';
import StorePagination from '@/components/store/StorePagination';
import {useStoreData} from "@/hooks/useStoreData.ts";

const StorePage = () => {
    const {
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        filteredData,
        currentData,
        totalPages,
        pageSize,
        resetSearch
    } = useStoreData(20);

    return (
        <div className="container px-4 py-6 mx-auto">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Store</h1>
                        <p className="text-muted-foreground">Manage your store across locations.</p>
                    </div>
                    <Button className="gap-2" asChild>
                        <Link to="/add-inventory">
                            <PackagePlus size={18}/>
                            Add Inventory
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Store Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StoreSearch
                            searchTerm={searchTerm}
                            setSearchTerm={(value) => {
                                setSearchTerm(value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                            resetSearch={resetSearch}
                        />

                        <StoreTable storeItems={currentData}/>

                        {filteredData.length > 0 && (
                            <StorePagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredData.length}
                                pageSize={pageSize}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default StorePage;