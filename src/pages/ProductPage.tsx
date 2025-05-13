import { useEffect } from "react";
import { ProductTable } from "@/components/product-table";
import { useProductStore } from "@/stores/product";
import { ProductModel } from "@/models/ProductModel";

export default function ProductPage() {
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, []);


  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <ProductTable data={products as ProductModel[]} />
      </div>
    </div>
  );
}







