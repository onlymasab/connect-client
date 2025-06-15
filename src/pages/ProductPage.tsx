import { useEffect, useMemo } from "react";
import { ProductTable } from "@/components/product-table";
import { useProductStore } from "@/stores/product";
import { ProductModel } from "@/models/DataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";

export default function ProductPage() {
  const {
    products,
    fetchProducts,
    subscribeToRealtime,
    unsubscribeFromRealtime,
  } = useProductStore();

  const {
    totalCount,
    totalPrice,
    inStockCount,
    outStockCount,
    lowStockCount,
    inactiveCount,
  } = useMemo(() => {
    const totalCount = products.length;
    const totalPrice = products.reduce((acc, p) => acc + p.price, 0);

    const inStockCount = products.filter(
      (p) => p.current_stock > 0
    ).length;

    const outStockCount = products.filter((p) => p.current_stock === 0).length;

    const lowStockCount = products.filter(
      (p) => p.current_stock > 0 && p.current_stock < p.minimum_req_stock
    ).length;

    const inactiveCount = products.filter((p) => !p.is_active).length;

    return {
      totalCount,
      totalPrice,
      inStockCount,
      outStockCount,
      lowStockCount,
      inactiveCount,
    };
  }, [products]);

  const getPercentage = (count: number) =>
    totalCount === 0 ? 0 : Math.round((count / totalCount) * 100);

  useEffect(() => {
    fetchProducts();
    subscribeToRealtime();
    return () => {
      unsubscribeFromRealtime();
    };
  }, [fetchProducts, subscribeToRealtime, unsubscribeFromRealtime]);

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
    <div className="flex flex-row gap-4">
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
      <div className="flex flex-col justify-between my-6">
        <h4 className="text-[18px]">{title}</h4>
        <p className="text-gray-400 w-24 text-[14px]">{count} products</p>
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
                <StatCard title="In Stock" count={inStockCount} value={0} />
                <StatCard title="Out Stock" count={outStockCount} value={0} />
                <StatCard title="Min Stock" count={lowStockCount} value={0} />
                <StatCard title="Inactive" count={inactiveCount} value={0} />
              </div>
            </CardTitle>
            <CardDescription>
              <hr />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductTable
              data={products as ProductModel[]}
              tableMeta={{
                updateData: (rowIndex, columnId, value) => {
                  console.log(
                    `Updating row ${rowIndex}, column ${columnId}, value:`,
                    value
                  );
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}