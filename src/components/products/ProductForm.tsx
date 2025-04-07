
import React from "react";
import { BasicInfoSection, CategorySection, ImageSection, StockSection } from "@/components/products/product-form";
import { useProductForm } from "@/hooks/products/useProductForm";
import { ProductFormActions } from "@/components/products/product-form/ProductFormActions";

export const ProductForm = () => {
  const {
    formData,
    loading,
    productImage,
    setProductImage,
    imagePreview,
    setImagePreview,
    saving,
    setSaving,
    handleChange,
    handleSelectChange,
    handleSubmit
  } = useProductForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BasicInfoSection 
        formData={formData} 
        handleChange={handleChange}
      />
      <CategorySection
        formData={formData}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
      />
      <ImageSection
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        setProductImage={setProductImage}
        uploadType="base64"
      />
      <StockSection 
        formData={formData} 
        handleChange={handleChange}
      />

      <ProductFormActions
        loading={loading}
        saving={saving}
        setSaving={setSaving}
        handleSubmit={handleSubmit}
      />
    </form>
  );
};
