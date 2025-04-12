import React, {useState} from 'react';
import {Product} from '@/types/product';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {ImageSection} from '@/components/products/product-form';
import {toast} from 'sonner';
import {productService} from '@/services/ProductService';
import {Notifications} from '@/utils/notifications';
import {useNavigate} from 'react-router-dom';
import {X} from 'lucide-react';

interface ProductEditFormProps {
  product: Product;
  categories: string[];
  subcategories: string[];
  onCancel: () => void;
}

const ProductEditForm: React.FC<ProductEditFormProps> = ({ 
  product, 
  categories, 
  subcategories,
  onCancel 
}) => {
  const navigate = useNavigate();
  const [name, setName] = useState(product.name);
  const [productCode, setProductCode] = useState(product.productCode || '');
  const [barcode, setBarcode] = useState(product.barcode || '');
  const [category, setCategory] = useState(product.category);
  const [subcategory, setSubcategory] = useState(product.subcategory);
  const [description, setDescription] = useState(product.description || '');
  const [keywords, setKeywords] = useState(product.keywords.join(', '));
  const [imagePreview, setImagePreview] = useState<string | null>(product.imageUrl || null);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!name.trim()) {
        toast.error("Product name is required");
        return;
      }

      // Prepare keywords array
      const keywordsArray = keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      // Prepare updated product object
      const updatedProduct: Product = {
        ...product,
        name,
        productCode,
        barcode,
        category,
        subcategory,
        description,
        keywords: keywordsArray,
        modifiedDate: new Date(),
        modifiedBy: localStorage.getItem('userName') || 'Unknown'
      };

      // Handle image if it was updated
      if (productImage) {
        // In a real implementation, you would upload the image and get a URL
        // For this example, we'll just use the existing image or the new preview
        updatedProduct.imageUrl = imagePreview;
      }

      // Save the updated product
      const result = await productService.updateProduct(updatedProduct);
      
      if (result) {
        Notifications.success("Product updated successfully");
        // Redirect back to the product details page
        navigate("/products");
      } else {
        throw new Error("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      Notifications.error("Error updating product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-green-50/50 dark:bg-green-900/30 border-green-100 dark:border-green-800/50">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="productCode">Product Code</Label>
                <Input 
                  id="productCode" 
                  value={productCode} 
                  onChange={(e) => setProductCode(e.target.value)} 
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="barcode">Barcode</Label>
                <Input 
                  id="barcode" 
                  value={barcode} 
                  onChange={(e) => setBarcode(e.target.value)} 
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select value={subcategory} onValueChange={setSubcategory}>
                    <SelectTrigger id="subcategory" className="mt-1">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((subcat) => (
                        <SelectItem key={subcat} value={subcat}>
                          {subcat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="keywords">Keywords (comma separated)</Label>
                <Input 
                  id="keywords" 
                  value={keywords} 
                  onChange={(e) => setKeywords(e.target.value)} 
                  className="mt-1"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="mt-1 min-h-[120px]"
                />
              </div>
            </div>
            
            <div>
              <ImageSection
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                setProductImage={setProductImage}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={onCancel}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductEditForm;
