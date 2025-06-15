import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import type { PostgrestError, RealtimeChannel } from "@supabase/supabase-js";
import type { PrecastProductMaterialModel } from "@/models/DataModel";

interface ProductRawMaterialStore {
  productRawMaterials: PrecastProductMaterialModel[];
  loading: boolean;
  error: string | null;

  fetchProductRawMaterials: () => Promise<void>;
  addProductRawMaterial: (material: PrecastProductMaterialModel) => Promise<void>;
  updateProductRawMaterial: (id: string, material: Partial<PrecastProductMaterialModel>) => Promise<void>;

  subscribeToRealtimeProductRawMaterial: () => void;
  unsubscribeFromRealtimeProductRawMaterial: () => void;

  retryFetch: () => void;
  retryAdd: (material: PrecastProductMaterialModel) => void;
}

let subscription: RealtimeChannel | null = null;
let hasFetched = false;

// ✅ Reuse parsing logic everywhere
function parseRawMaterial(item: any): PrecastProductMaterialModel {
  return {
    ...item,
    product: Array.isArray(item.product) ? item.product[0] : item.product,
    material: Array.isArray(item.material) ? item.material[0] : item.material,
  };
}

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

      const parsed = (data ?? []).map(parseRawMaterial);
      set({ productRawMaterials: parsed, loading: false });
    } catch (error) {
      const message = (error as PostgrestError)?.message || "Failed to fetch product materials";
      set({ error: message, loading: false });
      hasFetched = false;
    }
  },

  addProductRawMaterial: async (material) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("precast_product_materials")
        .insert([material])
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

      const parsed = (data ?? []).map(parseRawMaterial);
      set((state) => ({
        productRawMaterials: [...state.productRawMaterials, ...parsed],
        loading: false,
      }));
    } catch (error) {
      const message = (error as PostgrestError)?.message || "Failed to add product material";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  updateProductRawMaterial: async (id, updates) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("precast_product_materials")
        .update(updates)
        .eq("id", id)
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

      const [parsedItem] = (data ?? []).map(parseRawMaterial);

      set((state) => ({
        productRawMaterials: state.productRawMaterials.map((item) =>
          item.id === id ? parsedItem : item
        ),
        loading: false,
      }));
    } catch (error) {
      const message = (error as PostgrestError)?.message || "Failed to update product material";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  subscribeToRealtimeProductRawMaterial: () => {
    if (subscription) return;

    const channelId = `precast-product-materials-${Date.now()}`;
    subscription = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "precast_product_materials",
        },
        (payload) => {
          const current = get().productRawMaterials;
          const raw = payload.new || payload.old;
          if (!raw) return;

          try {
            const parsed = parseRawMaterial(raw);

            if (payload.eventType === "INSERT") {
              set({ productRawMaterials: [...current, parsed] });
            } else if (payload.eventType === "UPDATE") {
              set({
                productRawMaterials: current.map((item) =>
                  item.id === parsed.id ? parsed : item
                ),
              });
            } else if (payload.eventType === "DELETE") {
              set({
                productRawMaterials: current.filter((item) => item.id !== parsed.id),
              });
            }
          } catch (err) {
            console.warn("Realtime error:", err);
            set({ error: "Invalid real-time data received" });
          }
        }
      )
      .subscribe();
  },

  unsubscribeFromRealtimeProductRawMaterial: () => {
    if (subscription) {
      supabase.removeChannel(subscription);
      subscription = null;
    }
  },

  retryFetch: () => {
    hasFetched = false;
    get().fetchProductRawMaterials();
  },

  retryAdd: (material) => {
    get().addProductRawMaterial(material);
  },
}));