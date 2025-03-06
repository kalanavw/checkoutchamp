
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {fontStyle} from "html2canvas/dist/types/css/property-descriptors/font-style";

interface ProductsTableProps {
  products: Product[];
  loading: boolean;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export function ProductsTable({ products, loading, onDelete, onView }: ProductsTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No products found.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader style={{ fontWeight: "bold", color: "black" }}>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Sub Category</TableHead>
            <TableHead>Keywords</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="h-8 w-8 rounded object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No img</span>
                    </div>
                  )}
                  <Link to={`/products/${product.id}`} className="hover:text-green-600 transition-colors">
                    <span>{product.name}</span>
                  </Link>
                </div>
              </TableCell>
              <TableCell align={"left"}>{product.productCode}</TableCell>
              <TableCell align={"left"}>{product.category}</TableCell>
              <TableCell align={"left"}>{product.subcategory}</TableCell>
              <TableCell align={"left"}>
                {product.keywords.map((keyword, index) => (
                    <Badge
                        key={index}
                        variant="outline"
                        className="bg-accent text-green-700 border-green-200 mx-1"
                    >
                      {keyword.toUpperCase()}
                    </Badge>
                ))}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => onView(product.id)}
                    className="hover:text-green-600 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="hover:text-green-600 transition-colors"
                    onClick={() => onView(product.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
