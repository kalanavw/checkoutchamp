
import { useNavigate } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { ProductsFilter } from "@/components/products/ProductsFilter";
import { ProductsList } from "@/components/products/ProductsList";

const Products = () => {
  const navigate = useNavigate();
  const {
    products,
    loading,
    searchQuery,
    filter,
    hasMore,
    handleSearch,
    handleFilterChange,
    handleRefresh,
    deleteProduct,
    loadMore,
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
        filter={filter}
        onFilterChange={handleFilterChange}
      />
      
      <ProductsList 
        products={products}
        loading={loading}
        onLoadMore={loadMore}
        onDelete={deleteProduct}
        onView={handleViewProduct}
        hasMore={hasMore}
      />
    </div>
  );
};

export default Products;
