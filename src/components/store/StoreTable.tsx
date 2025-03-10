import React from 'react';
import {ExternalLink, Info} from 'lucide-react';
import {Link} from 'react-router-dom';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {Button} from '@/components/ui/button';
import {Store} from "@/types/store.ts";

interface StoreTableProps {
    storeItems: Store[];
}

const StoreTable: React.FC<StoreTableProps> = ({storeItems}) => {
    return (
        <div className="rounded-md border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>GRN Number</TableHead>
                        <TableHead>Cost Price</TableHead>
                        <TableHead>Selling Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {storeItems.length > 0 ? (
                        storeItems.map((item) => (
                            <TableRow key={item.id} className="hover:bg-muted/50">
                                <TableCell className="font-medium">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded overflow-hidden bg-muted mr-3">
                                            <img
                                                src={item.product.imageUrl}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div>{item.product.name}</div>
                                            <div
                                                className="text-xs text-muted-foreground">SKU: {item.product.productCode}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        {item.location.name}
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info size={14} className="text-muted-foreground cursor-help"/>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Code: {item.location.code}</p>
                                                    {item.location.description && <p>{item.location.description}</p>}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </TableCell>
                                <TableCell>{item.grnNumber || '-'}</TableCell>
                                <TableCell>${item.costPrice.toFixed(2)}</TableCell>
                                <TableCell>${item.sellingPrice.toFixed(2)}</TableCell>
                                <TableCell>{item.qty.totalQty}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={item.qty.availableQty < 10 ? "destructive" : "outline"}
                                        className={item.qty.availableQty >= 10 ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                                    >
                                        {item.qty.availableQty}
                                    </Badge>
                                </TableCell>
                                <TableCell>{item.discount ? `${item.discount.toFixed(1)}%` : '-'}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        asChild
                                        variant="ghost"
                                        size="icon"
                                        title="View Details"
                                    >
                                        <Link to={`/store/${item.id}`}>
                                            <ExternalLink size={16}/>
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                No store items found. Try adjusting your search or add new inventory.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default StoreTable;
