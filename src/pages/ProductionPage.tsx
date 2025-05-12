import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { ProductTable } from "@/components/product-table";
import { SectionCards } from "@/components/section-cards";
import { ProductModel } from "@/models/ProductModel";
import { useProductStore } from "@/stores/product";
import { useEffect } from "react";






export default function ProductionPage() {
    const { products, fetchProducts } = useProductStore();
    
      useEffect(() => {
        fetchProducts();
      }, []);
    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6">
                    <ChartAreaInteractive />
                </div>
                <ProductTable data={products as ProductModel[]} />
              </div>
        </div>
    );
}