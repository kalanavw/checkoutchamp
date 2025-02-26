
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Trash2 } from "lucide-react";

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  price: number;
  discount?: number;
}

interface InvoiceItemsProps {
  items: InvoiceItem[];
  onUpdateItem: (id: number, field: keyof InvoiceItem, value: string | number) => void;
  onRemoveItem: (id: number) => void;
  onAdjustQuantity: (id: number, increment: boolean) => void;
  onAddItem: () => void;
}

export function InvoiceItems({
  items,
  onUpdateItem,
  onRemoveItem,
  onAdjustQuantity,
  onAddItem,
}: InvoiceItemsProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Discount (%)</TableHead>
            <TableHead>Total</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const itemTotal = item.quantity * item.price;
            const discountAmount = itemTotal * ((item.discount || 0) / 100);
            const finalTotal = itemTotal - discountAmount;

            return (
              <TableRow key={item.id}>
                <TableCell className="min-w-[200px]">
                  <Input
                    value={item.description}
                    onChange={(e) => onUpdateItem(item.id, 'description', e.target.value)}
                    placeholder="Item description"
                    className="h-12 text-base"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onAdjustQuantity(item.id, false)}
                      className="h-8 w-8"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem(item.id, 'quantity', parseInt(e.target.value))}
                      className="w-20 h-12 text-base text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onAdjustQuantity(item.id, true)}
                      className="h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => onUpdateItem(item.id, 'price', parseFloat(e.target.value))}
                    className="w-28 h-12 text-base"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.discount || 0}
                    onChange={(e) => onUpdateItem(item.id, 'discount', parseFloat(e.target.value))}
                    className="w-20 h-12 text-base"
                  />
                </TableCell>
                <TableCell className="font-medium text-base">
                  ${finalTotal.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onRemoveItem(item.id)}
                    className="h-12 w-12"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      <Button 
        variant="outline" 
        onClick={onAddItem} 
        className="mt-6 h-12 px-6"
      >
        <Plus className="mr-2 h-5 w-5" />
        Add Item
      </Button>
    </div>
  );
}
