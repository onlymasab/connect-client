import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import { PrecastProductRawMaterialSchema } from "@/schema/DataSchema";
import type { PostgrestError, RealtimeChannel } from "@supabase/supabase-js";
import z from "zod";
import type { PrecastProductMaterialModel } from "@/models/DataModel";

interface ProductRawMaterialStore {
  productRawMaterials: PrecastProductMaterialModel[];
  loading: boolean;
  error: string | null;
  fetchProductRawMaterials: () => Promise<void>;
  addProductRawMaterial: (productRawMaterial: PrecastProductMaterialModel) => Promise<void>;
  updateProductRawMaterial: (id: string, productRawMaterial: Partial<PrecastProductMaterialModel>) => Promise<void>;
  subscribeToRealtimeProductRawMaterial: () => void;
  unsubscribeFromRealtimeProductRawMaterial: () => void;
  retryFetch: () => void;
  retryAdd: (productRawMaterial: PrecastProductMaterialModel) => void;
}

let subscription: RealtimeChannel | null = null;
let hasFetched = false;

export const useProductRawMaterialStore = create<ProductRawMaterialStore>((set, get) => ({
  productRawMaterials: [],
  loading: false,
  error: null,

  fetchProductRawMaterials: async () => {
    if (hasFetched) return;
    hasFetched = true;

    set({ loading: true, error: null });
    try {
     const { data, error } = await supabase
  .from("precast_product_materials")
  .select(`
    id,
    quantity,
    unit,
    created_at,
    product:product_id (
      product_id,
      name
    ),
    material:material_id (
      raw_material_id,
      name
    )
  `);
      if (error) throw error;

      console.log(data)

      const validated = z.array(PrecastProductRawMaterialSchema).parse(data);
      set({ productRawMaterials: validated, loading: false });
    } catch (error) {
      const message = (error as PostgrestError).message || "Failed to fetch product materials";
      set({ error: message, loading: false });
      console.error("Fetch error:", error);
      hasFetched = false; // Allow retry
    }
  },

  addProductRawMaterial: async (productRawMaterial: PrecastProductMaterialModel) => {
    set({ loading: true, error: null });
    try {
      PrecastProductRawMaterialSchema.parse(productRawMaterial);
      const { data, error } = await supabase
        .from("precast_product_materials")
        .insert([productRawMaterial])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        set((state) => ({
          productRawMaterials: [...state.productRawMaterials, data[0] as PrecastProductMaterialModel],
          loading: false,
        }));
      }
    } catch (error) {
      const message = (error as PostgrestError).message || "Failed to add product material";
      set({ error: message, loading: false });
      console.error("Insert error:", error);
      throw new Error(message);
    }
  },

  updateProductRawMaterial: async (id: string, updates: Partial<PrecastProductMaterialModel>) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("precast_product_materials")
        .update(updates)
        .eq("id", id)
        .select();

      if (error) throw error;

      if (data && data[0]) {
        set((state) => ({
          productRawMaterials: state.productRawMaterials.map((item) =>
            item.id === id ? (data[0] as PrecastProductMaterialModel) : item
          ),
          loading: false,
        }));
      }
    } catch (error) {
      const message = (error as PostgrestError).message || "Failed to update product material";
      set({ error: message, loading: false });
      console.error("Update error:", error);
      throw new Error(message);
    }
  },

  subscribeToRealtimeProductRawMaterial: () => {
    if (subscription) return;

    const channelId = `realtime-precast-product-materials-${Date.now()}`;
    subscription = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "precast_product_materials" },
        (payload) => {
          const current = get().productRawMaterials;
          try {
            if (payload.eventType === "INSERT" && payload.new) {
              const newItem = PrecastProductRawMaterialSchema.parse(payload.new);
              set({ productRawMaterials: [...current, newItem] });
            } else if (payload.eventType === "UPDATE" && payload.new) {
              const updated = PrecastProductRawMaterialSchema.parse(payload.new);
              set({
                productRawMaterials: current.map((item) =>
                  item.id === updated.id ? updated : item
                ),
              });
            } else if (payload.eventType === "DELETE" && payload.old) {
              const deletedId = PrecastProductRawMaterialSchema.parse(payload.old).id;
              set({
                productRawMaterials: current.filter((item) => item.id !== deletedId),
              });
            }
          } catch (err) {
            console.warn("Realtime payload error:", err);
            set({ error: "Invalid real-time data received" });
          }
        }
      )
      .subscribe();
  },

  unsubscribeFromRealtimeProductRawMaterial: () => {
    if (!subscription) return;
    supabase.removeChannel(subscription);
    subscription = null;
  },

  retryFetch: () => {
    hasFetched = false;
    get().fetchProductRawMaterials();
  },

  retryAdd: (productRawMaterial: PrecastProductMaterialModel) => {
    get().addProductRawMaterial(productRawMaterial);
  },
}));