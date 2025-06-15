import { ProductMaterialTable } from "@/components/product-material-table";
import {  RawMaterialChart } from "@/components/raw-material-chart";
import { RawMaterialTable } from "@/components/raw-material-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { PrecastProductMaterialModel, RawMaterialModel, RawMaterialUsageModel } from "@/models/DataModel";
import { useProductRawMaterialStore } from "@/stores/product-raw-material";
import { useRawMaterialStore } from "@/stores/raw-material";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { format } from "date-fns"; // make sure to install date-fns

type ChartDataItem = {
  date: string;
  inStock: number; // in stock count
  outStock: number;  // out of stock count
};


export default function MaterialPage() {
      

      const {
  rawMaterials,
  fetchRawMaterials,
  subscribeToRealtime,
  unsubscribeFromRealtime,
} = useRawMaterialStore();

const {
  totalCount,
  totalPrice,
  inStockCount,
  inStockPrice,
  outStockCount,
  outStockPrice,
  lowStockCount,
  lowStockPrice,
} = useMemo(() => {
  let totalPrice = 0;
  let inStockCount = 0;
  let inStockPrice = 0;
  let outStockCount = 0;
  let outStockPrice = 0;
  let lowStockCount = 0;
  let lowStockPrice = 0;

  for (const material of rawMaterials) {
    const stock = material.current_stock ?? 0;
    const cost = material.cost_per_unit ?? 0;
    const minStock = material.min_required_stock ?? 0;

    const value = stock * cost;
    totalPrice += value;

    if (stock > 0) {
      inStockCount++;
      inStockPrice += value;

      if (stock < minStock) {
        lowStockCount++;
        lowStockPrice += value;
      }
    } else {
      outStockCount++;
      outStockPrice += 0; // or skip this line entirely
    }
  }

  return {
    totalCount: rawMaterials.length,
    totalPrice,
    inStockCount,
    inStockPrice,
    outStockCount,
    outStockPrice,
    lowStockCount,
    lowStockPrice,
  };
}, [rawMaterials]);

const chartData = useMemo(() => {
  const dailyStats: Record<string, { inStock: number; outStock: number }> = {};

  for (const material of rawMaterials) {
    const stock = material.current_stock ?? 0;
    const updatedAt = material.updated_at ? new Date(material.updated_at) : null;
    if (!updatedAt) continue;

    const date = format(updatedAt, "yyyy-MM-dd");

    if (!dailyStats[date]) {
      dailyStats[date] = { inStock: 0, outStock: 0 };
    }

    if (stock > 0) {
      dailyStats[date].inStock++;
    } else {
      dailyStats[date].outStock++;
    }
  }

  // Convert to array in the format you want
  return Object.entries(dailyStats)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime()) // sort by date
    .map(([date, stats]) => ({
      date,
      inStock: stats.inStock, // or rename to `inStock`
      outStock: stats.outStock, // or rename to `outStock`
    }));
}, [rawMaterials]);

const getPercentage = (count: number) =>
  totalCount === 0 ? 0 : Math.round((count / totalCount) * 100);


      useEffect(() => {
          fetchRawMaterials();
          subscribeToRealtime();
          return () => {
            unsubscribeFromRealtime();
          };
        }, [fetchRawMaterials, subscribeToRealtime, unsubscribeFromRealtime]);

        const {
        productRawMaterials,
        fetchProductRawMaterials,
        subscribeToRealtimeProductRawMaterial,
        unsubscribeFromRealtimeProductRawMaterial,
      } = useProductRawMaterialStore();


      useEffect(() => {
          fetchProductRawMaterials();
          subscribeToRealtimeProductRawMaterial();
          return () => {
            unsubscribeFromRealtimeProductRawMaterial();
          };
        }, [fetchProductRawMaterials, subscribeToRealtimeProductRawMaterial, unsubscribeFromRealtimeProductRawMaterial]);

         const StatCard = ({
            title,
            count,
            value,
            color = "stroke-green-600",
          }: {
            title: string;
            count: number;
            value: number;
            color?: string;
          }) => (
            <div className="flex flex-row gap-1">
              <div className="max-w-xs mx-auto w-full flex flex-col items-center relative">
                <CircularProgress
                  value={getPercentage(count)}
                  size={120}
                  strokeWidth={10}
                  showLabel
                  renderLabel={(val: any) => `${val}%`}
                  className="stroke-gray-300"
                  progressClassName={color}
                  labelClassName="text-lg font-bold text-green-600"
                />
              </div>
              <div className="flex flex-col justify-between my-6 w-56">
                <h4 className="text-[18px]">{title}</h4>
                <p className="text-gray-400 w-24 text-[14px]">{count} materials</p>
                {value !== undefined && (
                  <p className="text-[15px]">
                    PKR {value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>
          );
       
    return (
       <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <RawMaterialChart chartData={chartData as ChartDataItem[]} />
              <Card>
                <CardHeader>
                    <CardTitle>
                      <div className="flex flex-wrap gap-6 justify-between pr-8">
                        <StatCard
                          title="Total"
                          count={totalCount}
                          value={totalPrice}
                          color="stroke-blue-500"
                        />
                        <StatCard title="In Stock" count={inStockCount} value={inStockPrice} />
                        <StatCard title="Out Stock" count={outStockCount} value={outStockPrice} />
                        <StatCard title="Min Stock" count={lowStockCount} value={lowStockPrice} />
                      </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                  <RawMaterialTable data={rawMaterials as RawMaterialModel[]} tableMeta={{ updateData: () => {} }} />
                </CardContent>
              </Card>
               
                {/* Product Material Usage Table */}
                <Card>
                  <CardContent>
                    <ProductMaterialTable data={productRawMaterials as PrecastProductMaterialModel[]} tableMeta={{ updateData: () => {} }} />
                  </CardContent>
                </Card>
                
            </div>
        </div>
    );
}