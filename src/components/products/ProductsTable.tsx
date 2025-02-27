
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Product } from "@/types/product";

interface ProductsTableProps {
  products: Product[];
  loading: boolean;
  onUpdateProduct: (id: string, field: keyof Product, value: string | number) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
}

export const ProductsTable = ({
  products,
  loading,
  onUpdateProduct,
  onDeleteProduct
}: ProductsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading products...
                </div>
              </TableCell>
            </TableRow>
          ) : products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No products found
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Input
                    value={product.name}
                    onChange={(e) => onUpdateProduct(product.id, 'name', e.target.value)}
                    className="max-w-[200px]"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={product.category}
                    onChange={(e) => onUpdateProduct(product.id, 'category', e.target.value)}
                    className="max-w-[150px]"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={product.price}
                    onChange={(e) => onUpdateProduct(product.id, 'price', parseFloat(e.target.value))}
                    className="max-w-[100px]"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={product.stock}
                    onChange={(e) => onUpdateProduct(product.id, 'stock', parseInt(e.target.value))}
                    className="max-w-[100px]"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteProduct(product.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
