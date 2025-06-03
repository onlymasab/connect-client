import { useEffect } from "react";
import { ProductTable } from "@/components/product-table";
import { useProductStore } from "@/stores/product";
import { ProductModel } from "@/models/DataModel";

export default function ProductPage() {
  const { products, fetchProducts, subscribeToRealtime, unsubscribeFromRealtime } = useProductStore();

  useEffect(() => {
    fetchProducts();
    subscribeToRealtime();
    return () => {
      unsubscribeFromRealtime();
    };
  }, [fetchProducts, subscribeToRealtime, unsubscribeFromRealtime]);

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <ProductTable
          data={products as ProductModel[]}
          tableMeta={{
            updateData: (rowIndex, columnId, value) => {
              console.log(`Updating row ${rowIndex}, column ${columnId}, value:`, value);
              // TODO: hook this into your Zustand store update if needed
            },
          }}
        />
      </div>
    </div>
  );
}