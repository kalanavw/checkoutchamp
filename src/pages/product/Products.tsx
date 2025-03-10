import {useNavigate} from "react-router-dom";
import {useProducts} from "@/hooks/useProducts.ts";
import {ProductsHeader} from "@/components/products/ProductsHeader.tsx";
import {ProductsFilter} from "@/components/products/ProductsFilter.tsx";
import {ProductsList} from "@/components/products/ProductsList.tsx";

const Products = () => {
  const navigate = useNavigate();
  const {
    products,
    loading,
    searchQuery,
    categoryFilter,
    subcategoryFilter,
    categories,
    subcategories,
    totalProducts,
    currentPage,
    pageSize,
    handleSearch,
    handleCategoryChange,
    handleSubcategoryChange,
    handleRefresh,
    deleteProduct,
    handlePageChange,
  } = useProducts();

  const handleViewProduct = (id: string) => {
    navigate(`/products/${id}`);
  };

  return (
    <div className="container px-4 py-6 mx-auto">
      <ProductsHeader loading={loading} onRefresh={handleRefresh} />
      
      <ProductsFilter 
        searchQuery={searchQuery}
        onSearch={handleSearch}
        categoryFilter={categoryFilter}
        subcategoryFilter={subcategoryFilter}
        categories={categories}
        subcategories={subcategories}
        onCategoryChange={handleCategoryChange}
        onSubcategoryChange={handleSubcategoryChange}
        loading={loading}
      />
      
      <ProductsList 
        products={products}
        loading={loading}
        totalProducts={totalProducts}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onDelete={deleteProduct}
        onView={handleViewProduct}
      />
    </div>
  );
};

export default Products;
