import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import { PrecastProductRawMaterialSchema, ProductSchema, RawMaterialSchema } from "@/schema/DataSchema"; // Adjust path as needed
import type { PostgrestError, RealtimeChannel } from "@supabase/supabase-js";
import z from "zod";
import { PrecastProductMaterialModel, ProductModel, RawMaterialModel } from "@/models/DataModel";
import { toast } from "sonner";


interface ProductRawMaterialStore {
  productRawMaterials: PrecastProductMaterialModel[];
  loading: boolean;
  error: string | null;
  fetchProductRawMaterials: () => Promise<void>;
  addProductRawMaterial: (productRawMaterial: PrecastProductMaterialModel) => Promise<void>;
  updateProductRawMaterial: (id: string, productRawMaterial: Partial<PrecastProductMaterialModel>) => Promise<void>; // New method
  subscribeToRealtime: () => void;
  unsubscribeFromRealtime: () => void;
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
  if (hasFetched) {
    console.log("Already fetched, skipping...");
    return;
  }
  hasFetched = true;

  set({ loading: true, error: null });
  console.log("Fetching products...");

  try {
    const { data, error } = await supabase.from("precast_product_materials").select(`
    id,
    quantity,
    unit,
    created_at,
    product:product_id (
      name
    ),
    material:material_id (
      name
    )
  `);
    console.log("Supabase response:", { data, error });
    console.log("Data fetched:", data);
    if (error) throw error;

    const validatedProductRawMaterials = z.array(PrecastProductRawMaterialSchema).parse(data);
    console.log(validatedProductRawMaterials)
    console.log("Validated Raw Material:", validatedProductRawMaterials);
    console.log("RawMaterils set in store/state.");
    set({ productRawMaterials: validatedProductRawMaterials, loading: false });
    
  } catch (error) {
    const message = (error as PostgrestError).message || "Failed to fetch products";
    set({ error: message, loading: false });
    console.error("Fetch error:", error);
  }
},

  addProductRawMaterial: async (productRawMaterial: PrecastProductMaterialModel) => {
    set({ loading: true, error: null });
    try {
      PrecastProductRawMaterialSchema.parse(productRawMaterial);
      const { data, error } = await supabase.from("precast_product_materials").insert([rawMaterial]).select();
      if (error) throw error;
      if (data && data[0]) {
        set((state) => ({
          rawMaterials: [...state.rawMaterials, data[0] as RawMaterialModel],
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

  updateRawMaterial: async (raw_material_id: string, rawMaterial: Partial<RawMaterialModel>) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("raw_materials")
        .update(rawMaterial)
        .eq("raw_material_id", raw_material_id)
        .select();
      if (error) throw error;
      if (data && data[0]) {
        set((state) => ({
          rawMaterials: state.rawMaterials.map((p) =>
            p.raw_material_id === raw_material_id ? (data[0] as RawMaterialModel) : p
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
    const channelId = `rawMaterils-realtime-${Date.now()}`;
    subscription = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "raw_materials" },
        (payload) => {
          const currentRawMaterials = get().rawMaterials;
          try {
            if (payload.eventType === "INSERT" && payload.new) {
              const newRawMaterial = RawMaterialSchema.parse(payload.new);
              set({ rawMaterials: [...currentRawMaterials, newRawMaterial] });
            } else if (payload.eventType === "UPDATE" && payload.new) {
              const updatedRawMaterial = RawMaterialSchema.parse(payload.new);
              set({
                rawMaterials: currentRawMaterials.map((p) =>
                  p.raw_material_id === updatedRawMaterial.raw_material_id ? updatedRawMaterial : p
                ),
              });
            } else if (payload.eventType === "DELETE" && payload.old) {
              const deletedMaterialId = RawMaterialSchema.parse(payload.old).raw_material_id;
              set({
                rawMaterials: currentRawMaterials.filter((p) => p.raw_material_id !== deletedMaterialId),
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

  retryFetch: () => get().fetchRawMaterials(),
  retryAdd: (rawMaterial: RawMaterialModel) => get().addRawMaterial(rawMaterial),
}));