import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import { ProductSchema } from "@/schema/DataSchema"; // Adjust path as needed
import type { PostgrestError, RealtimeChannel } from "@supabase/supabase-js";
import z from "zod";
import { ProductModel } from "@/models/DataModel";
import { toast } from "sonner";


interface ProductStore {
  products: ProductModel[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: ProductModel) => Promise<void>;
  updateProduct: (sku_id: string, product: Partial<ProductModel>) => Promise<void>; // New method
  subscribeToRealtime: () => void;
  unsubscribeFromRealtime: () => void;
  retryFetch: () => void;
  retryAdd: (product: ProductModel) => void;
}



let subscription: RealtimeChannel | null = null;
let hasFetched = false;

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,

 fetchProducts: async () => {
  if (hasFetched) {
    console.log("Already fetched, skipping...");
    return;
  }
  hasFetched = true;

  set({ loading: true, error: null });
  console.log("Fetching products...");

  try {
    const { data, error } = await supabase.from("products").select("*");
    console.log("Supabase response:", { data, error });
    console.log("Data fetched:", data);
    if (error) throw error;

    const validatedProducts = z.array(ProductSchema).parse(data);
    console.log("Validated products:", validatedProducts);

    set({ products: validatedProducts, loading: false });
    console.log("Products set in store/state.");
  } catch (error) {
    const message = (error as PostgrestError).message || "Failed to fetch products";
    set({ error: message, loading: false });
    console.error("Fetch error:", error);
  }
},

  addProduct: async (product: ProductModel) => {
    set({ loading: true, error: null });
    try {
      ProductSchema.parse(product);
      const { data, error } = await supabase.from("products").insert([product]).select();
      if (error) throw error;
      if (data && data[0]) {
        set((state) => ({
          products: [...state.products, data[0] as ProductModel],
          loading: false,
          error: null,
        }));
      }
    } catch (error) {
      const message = (error as PostgrestError).message || "Failed to add product";
      set({ error: message, loading: false });
      console.error("Insert error:", error);
      throw new Error(message);
    }
  },

  updateProduct: async (sku_id: string, product: Partial<ProductModel>) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("products")
        .update(product)
        .eq("sku_id", sku_id)
        .select();
      if (error) throw error;
      if (data && data[0]) {
        set((state) => ({
          products: state.products.map((p) =>
            p.sku_id === sku_id ? (data[0] as ProductModel) : p
          ),
          loading: false,
          error: null,
        }));
      }
    } catch (error) {
      const message = (error as PostgrestError).message || "Failed to update product";
      set({ error: message, loading: false });
      console.error("Update error:", error);
      throw new Error(message);
    }
  },

  subscribeToRealtime: () => {
    if (subscription) return;
    const channelId = `products-realtime-${Date.now()}`;
    subscription = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          const currentProducts = get().products;
          try {
            if (payload.eventType === "INSERT" && payload.new) {
              const newProduct = ProductSchema.parse(payload.new);
              set({ products: [...currentProducts, newProduct] });
            } else if (payload.eventType === "UPDATE" && payload.new) {
              const updatedProduct = ProductSchema.parse(payload.new);
              set({
                products: currentProducts.map((p) =>
                  p.sku_id === updatedProduct.sku_id ? updatedProduct : p
                ),
              });
            } else if (payload.eventType === "DELETE" && payload.old) {
              const deletedSku = ProductSchema.parse(payload.old).sku_id;
              set({
                products: currentProducts.filter((p) => p.sku_id !== deletedSku),
              });
            }
          } catch (error) {
            console.warn("Realtime update error:", error, "Payload:", payload);
            set({ error: "Invalid real-time data received" });
          }
        }
      )
      .subscribe();
  },

  unsubscribeFromRealtime: () => {
    if (!subscription) return;
    supabase.removeChannel(subscription);
    subscription = null;
  },

  retryFetch: () => get().fetchProducts(),
  retryAdd: (product: ProductModel) => get().addProduct(product),
}));