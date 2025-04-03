
import React from 'react';
import {PackagePlus, RefreshCcw} from 'lucide-react';
import {Link} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import StoreSearch from '@/components/store/StoreSearch';
import StoreTable from '@/components/store/StoreTable';
import StorePagination from '@/components/store/StorePagination';
import {useStoreData} from "@/hooks/useStoreData.ts";
import {Skeleton} from "@/components/ui/skeleton";
import {toast} from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const StorePage = () => {
    const {
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        filteredData,
        currentData,
        totalPages,
        resetSearch,
        isLoading,
        isRefreshing,
        error,
        refreshData
    } = useStoreData(50);

    React.useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleRefresh = () => {
        toast.info("Refreshing store data...");
        refreshData();
    };

    const handlePageSizeChange = (value: string) => {
        setPageSize(Number(value));
    };

    return (
        <div className="container px-4 py-6 mx-auto">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Store</h1>
                        <p className="text-muted-foreground">Manage your store across locations.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            className="gap-2" 
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCcw size={18} className={isRefreshing ? "animate-spin" : ""} />
                            Refresh
                        </Button>
                        <Button className="gap-2" asChild>
                            <Link to="/add-inventory">
                                <PackagePlus size={18}/>
                                Add Inventory
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Store Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                            <StoreSearch
                                searchTerm={searchTerm}
                                setSearchTerm={(value) => {
                                    setSearchTerm(value);
                                    setCurrentPage(1); // Reset to first page on search
                                }}
                                resetSearch={resetSearch}
                            />
                        </div>

                        {isLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : (
                            <>
                                <StoreTable storeItems={currentData} />

                                {filteredData.length > 0 && (
                                    <>
                                        <div className="flex items-center justify-end gap-2 mt-4">
                                            <span className="text-sm text-muted-foreground whitespace-nowrap">Items per page:</span>
                                            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                                                <SelectTrigger className="w-20">
                                                    <SelectValue placeholder="50" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="50">50</SelectItem>
                                                    <SelectItem value="100">100</SelectItem>
                                                    <SelectItem value="150">150</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <StorePagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            totalItems={filteredData.length}
                                            pageSize={pageSize}
                                            onPageChange={setCurrentPage}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default StorePage;

