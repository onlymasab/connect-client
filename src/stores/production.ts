import { supabase } from "@/lib/supabase/client";
import { ProductionBatchModel } from "@/models/DataModel";
import { ProductionBatchSchema } from "@/schema/DataSchema";
import { PostgrestError, RealtimeChannel } from "@supabase/supabase-js";
import z from "zod";
import { create } from "zustand";

interface ProductionStore {
  productions: ProductionBatchModel[];
  loading: boolean;
  error: string | null;
  fetchProductions: () => Promise<void>;
  addProductions: (product: ProductionBatchModel) => Promise<void>;
  updateProductions: (sku_id: string, productions: Partial<ProductionBatchModel>) => Promise<void>; // New method
  subscribeToRealtimeProductions: () => void;
  unsubscribeFromRealtimeProductions: () => void;
  retryFetch: () => void;
  retryAdd: (productions: ProductionBatchModel) => void;
}



let subscription: RealtimeChannel | null = null;
let hasFetched = false;

export const useProductionStore = create<ProductionStore>((set, get) => ({
  productions: [],
  loading: false,
  error: null,

 fetchProductions: async () => {
  if (hasFetched) {
    console.log("Already fetched, skipping...");
    return;
  }
  hasFetched = true;

  set({ loading: true, error: null });
  console.log("Fetching products...");

  try {
    const { data, error } = await supabase.from("production_batches").select("*");
    console.log("Supabase response:", { data, error });
    console.log("Data fetched:", data);
    if (error) throw error;

    const validatedProductions = z.array(ProductionBatchSchema).parse(data);
    console.log(validatedProductions)
    console.log("Validated products:", validatedProductions);
    console.log("Products set in store/state.");
    set({ productions: validatedProductions, loading: false });
    
  } catch (error) {
    const message = (error as PostgrestError).message || "Failed to fetch products";
    set({ error: message, loading: false });
    console.error("Fetch error:", error);
  }
},

  addProductions: async (productions: ProductionBatchModel) => {
    set({ loading: true, error: null });
    try {
      ProductionBatchSchema.parse(productions);
      const { data, error } = await supabase.from("production_batches").insert([productions]).select();
      if (error) throw error;
      if (data && data[0]) {
        set((state) => ({
          productions: [...state.productions, data[0] as ProductionBatchModel],
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

  updateProductions: async (batch_number: string, productions: Partial<ProductionBatchModel>) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("production_batches")
        .update(productions)
        .eq("batch_number", batch_number)
        .select();
      if (error) throw error;
      if (data && data[0]) {
        set((state) => ({
          productions: state.productions.map((p) =>
            p.batch_number === batch_number ? (data[0] as ProductionBatchModel) : p
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

  subscribeToRealtimeProductions: () => {
    if (subscription) return;
    const channelId = `productions-realtime-${Date.now()}`;
    subscription = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "production_batches" },
        (payload) => {
          const currentProductions = get().productions;
          try {
            if (payload.eventType === "INSERT" && payload.new) {
              const newProduct = ProductionBatchSchema.parse(payload.new);
              set({ productions: [...currentProductions, newProduct] });
            } else if (payload.eventType === "UPDATE" && payload.new) {
              const updatedProduct = ProductionBatchSchema.parse(payload.new);
              set({
                productions: currentProductions.map((p) =>
                  p.batch_number=== updatedProduct.batch_number ? updatedProduct : p
                ),
              });
            } else if (payload.eventType === "DELETE" && payload.old) {
              const deletedSku = ProductionBatchSchema.parse(payload.old).batch_number;
              set({
                productions: currentProductions.filter((p) => p.batch_number !== deletedSku),
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

  unsubscribeFromRealtimeProductions: () => {
    if (!subscription) return;
    supabase.removeChannel(subscription);
    subscription = null;
  },

  retryFetch: () => get().fetchProductions(),
  retryAdd: (productions: ProductionBatchModel) => get().addProductions(productions),
}));