// src/schema/product.ts
import { z } from "zod";
import { productTypes, productCategories } from "@/constants/productOptions";

export const productSchema = z.object({
  sku_id: z.string().min(1, "SKU ID is required"),
  name: z.string().min(1, "Name is required"),
  category: z.enum(productCategories as [string, ...string[]], {
    errorMap: () => ({ message: "Category is required" }),
  }),
  type: z.enum(productTypes as [string, ...string[]], {
    errorMap: () => ({ message: "Type is required" }),
  }),
  dimensions: z.string().min(1, "Dimensions are required"),
  weight: z.number().min(0, "Weight must be non-negative"),
  material: z.string().min(1, "Material is required"),
  strength: z.string().min(1, "Strength is required"),
  is_active: z.boolean(),
  is_deprecated: z.boolean(),
  created_at: z.string().regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)$/,
    "Invalid ISO timestamp format"
  ),
  updated_at: z.string().regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)$/,
    "Invalid ISO timestamp format"
  ),
});

export type Product = z.infer<typeof productSchema>;