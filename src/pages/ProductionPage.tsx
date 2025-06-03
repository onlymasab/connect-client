import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { ProductTable } from "@/components/product-table";
import { ProductionTable } from "@/components/production-table";
import { SectionCards } from "@/components/section-cards";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useProductStore } from "@/stores/product";
import React, { useEffect } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { format } from "date-fns";
import { useProductionStore } from "@/stores/production";
import { ProductionBatchModel } from "@/models/DataModel";

export const ProductionFormSchema = z.object({
  batch_number: z
    .string()
    .regex(/^PBN[0-9]{4}$/, "Batch number must match format PBN0000"),
  product_id: z.string().min(1, "Select a product"),
  start_at: z.date({ required_error: "A production start date is required" }),
  end_at: z.date({ required_error: "A production end date is required" }),
  status: z.enum(["pending", "in_progress", "completed", "halted"]),
  quantity_produced: z.coerce
    .number()
    .positive("Quantity must be a positive number"),
  quantity_wasted: z.coerce.number().min(0, "Waste quantity cannot be negative"),
  note: z.string().optional(),
});

export default function ProductsPage() {

  const {
    productions,
    fetchProductions,
    subscribeToRealtimeProductions,
    unsubscribeFromRealtimeProductions,
  } = useProductionStore();

  


  const {
    products,
    fetchProducts,
    subscribeToRealtime,
    unsubscribeFromRealtime,
  } = useProductStore();

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  useEffect(() => {
    fetchProducts();
    subscribeToRealtimeProductions();
    return () => {
      unsubscribeFromRealtimeProductions();
    };
  }, [fetchProducts, subscribeToRealtimeProductions, unsubscribeFromRealtimeProductions]);

  const form = useForm({
    resolver: zodResolver(ProductionFormSchema),
  });

  useEffect(() => {
    fetchProductions();
    subscribeToRealtime();
    return () => {
      unsubscribeFromRealtime();
    };
  }, [fetchProductions, subscribeToRealtime, unsubscribeFromRealtime]);


  function onSubmit(data: any) {
    toast("You submitted the following values", {
      description: (
        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
    setIsDrawerOpen(false);
    form.reset();
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex flex-row justify-between">
          <Tabs defaultValue="overview" className="w-full">
            <div className="flex flow-row justify-between">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
                <Button
                variant="outline"
                size="sm"
                className="hidden @4xl/main:flex"
                onClick={() => setIsDrawerOpen(true)}
                >
                <span className="hidden lg:inline">Add New</span>
                <span className="lg:hidden">New</span>
              </Button>
            </div>
            
            <TabsContent value="overview">
              {/* You can put ChartAreaInteractive or other overview content here */}
              <div className="w-full">
                <ChartAreaInteractive />
              </div>
            </TabsContent>
            <TabsContent value="all">
              {/* Example placeholder: replace with actual ProductionTable */}
              <ProductionTable data={productions as ProductionBatchModel[]} tableMeta={{ updateData: () => {} }} />
            </TabsContent>
          </Tabs>

          
        </div>

        {/* Product table section */}
        {/* <ProductTable products={products} /> */}

        {/* Production batch drawer */}
        {isDrawerOpen && (
          <Drawer
            direction="right"
            open
            onOpenChange={(open) => !open && setIsDrawerOpen(false)}
          >
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>New Production Batch</DrawerTitle>
                <DrawerDescription>Enter production details.</DrawerDescription>
              </DrawerHeader>

              <div className="flex flex-col gap-4 px-4 h-full">
                  <Form {...form}>
                    <form
                      className="flex flex-col gap-4"
                      onSubmit={form.handleSubmit(onSubmit)}
                    >
                      {/* Top row: batch + status */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full ">
                        <FormField
                          control={form.control}
                          name="batch_number"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>Batch Number</FormLabel>
                              <FormControl>
                                <Input placeholder="PBN0000" {...field} className="w-full" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>Status</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="w-full">
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="halted">Halted</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Product selector */}
                      <FormField
                        control={form.control}
                        name="product_id"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Product Name</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent className="w-full">
                                {products.map((product) => (
                                  <SelectItem
                                    key={product.product_id}
                                    value={product.product_id}
                                  >
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Dates */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <FormField
                          control={form.control}
                          name="start_at"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>Start At</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  value={
                                    field.value ? format(field.value, "yyyy-MM-dd") : ""
                                  }
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value ? new Date(e.target.value) : undefined
                                    )
                                  }
                                  className="w-full"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="end_at"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>End At</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  value={
                                    field.value ? format(field.value, "yyyy-MM-dd") : ""
                                  }
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value ? new Date(e.target.value) : undefined
                                    )
                                  }
                                  className="w-full"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Quantity fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <FormField
                          control={form.control}
                          name="quantity_produced"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>Quantity Produced</FormLabel>
                              <FormControl>
                                <Input type="number" step="1" {...field} className="w-full" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="quantity_wasted"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>Quantity Wasted</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="1"
                                  min="0"
                                  {...field}
                                  className="w-full"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Note */}
                      <FormField
                        control={form.control}
                        name="note"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Note</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Any additional notes"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Buttons */}
                      <DrawerFooter className="flex flex-col gap-2">
                        <Button type="submit" className="w-full sm:w-auto">
                          Save Production
                        </Button>
                        <DrawerClose asChild>
                          <Button
                            variant="outline"
                            type="button"
                            className="w-full sm:w-auto"
                          >
                            Cancel
                          </Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </form>
                  </Form>
                </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </div>
  );
}