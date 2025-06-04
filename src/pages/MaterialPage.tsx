import { ProductMaterialTable } from "@/components/product-material-table";
import { RawMaterialTable } from "@/components/raw-material-table";
import { RawMaterialModel, RawMaterialUsageModel } from "@/models/DataModel";
import { useRawMaterialStore } from "@/stores/raw-material";
import { useEffect } from "react";
import { toast } from "sonner";




export default function MaterialPage() {

    const {
        rawMaterials,
        fetchRawMaterials,
        subscribeToRealtime,
        unsubscribeFromRealtime,
      } = useRawMaterialStore();


      useEffect(() => {
          fetchRawMaterials();
          subscribeToRealtime();
          return () => {
            unsubscribeFromRealtime();
          };
        }, [fetchRawMaterials, subscribeToRealtime, unsubscribeFromRealtime]);




    return (
       <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
               <RawMaterialTable data={rawMaterials as RawMaterialModel[]} tableMeta={{ updateData: () => {} }} />
                {/* Product Material Usage Table */}
                <ProductMaterialTable data={rawMaterials as RawMaterialModel[]} tableMeta={{ updateData: () => {} }} />
            </div>
        </div>
    );
}