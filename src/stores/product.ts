import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import { ProductModel } from '@/models/ProductModel';

interface ProductStore {
  products: ProductModel[];
  fetchProducts: () => Promise<void>;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],

  fetchProducts: async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Fetch error:', error);
      return;
    }
    set({ products: data as ProductModel[] });
  },
}));