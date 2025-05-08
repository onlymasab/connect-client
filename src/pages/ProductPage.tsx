import { ProductTable } from "@/components/product-table"
import data from "@/assets/json/dashboard.json"
import { SectionCards } from "@/components/section-cards";



export default function ProductPage() {
    return (
        
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
              <ProductTable data={data} />
            </div>
          </div>
    );
}
