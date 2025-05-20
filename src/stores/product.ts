import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import { productSchema, Product } from "@/schema/product"; // Adjust path as needed

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (sku_id: string, product: Partial<Product>) => Promise<void>; // New method
  subscribeToRealtime: () => void;
  unsubscribeFromRealtime: () => void;
  retryFetch: () => void;
  retryAdd: (product: Product) => void;
}

import type { PostgrestError, RealtimeChannel } from "@supabase/supabase-js";
import z from "zod";

let subscription: RealtimeChannel | null = null;

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      const validatedProducts = z.array(productSchema).parse(data);
      set({ products: validatedProducts, loading: false });
    } catch (error) {
      const message = (error as PostgrestError).message || "Failed to fetch products";
      set({ error: message, loading: false });
      console.error("Fetch error:", error);
    }
  },

  addProduct: async (product: Product) => {
    set({ loading: true, error: null });
    try {
      productSchema.parse(product);
      const { data, error } = await supabase.from("products").insert([product]).select();
      if (error) throw error;
      if (data && data[0]) {
        set((state) => ({
          products: [...state.products, data[0] as Product],
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

  updateProduct: async (sku_id: string, product: Partial<Product>) => {
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
            p.sku_id === sku_id ? (data[0] as Product) : p
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
              const newProduct = productSchema.parse(payload.new);
              set({ products: [...currentProducts, newProduct] });
            } else if (payload.eventType === "UPDATE" && payload.new) {
              const updatedProduct = productSchema.parse(payload.new);
              set({
                products: currentProducts.map((p) =>
                  p.sku_id === updatedProduct.sku_id ? updatedProduct : p
                ),
              });
            } else if (payload.eventType === "DELETE" && payload.old) {
              const deletedSku = productSchema.parse(payload.old).sku_id;
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
  retryAdd: (product: Product) => get().addProduct(product),
}));