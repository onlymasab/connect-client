export interface ProductModel {
  sku_id: string;               // Unique SKU code
  name: string;                 // Product name
  category: string;             // Product category
  type: string;                 // Specific type or variation
  dimensions: string;           // Dimensions (e.g., "60x30x30")
  weight: number;               // Weight in kg or tons
  material: string;             // Material type (e.g., "Wood", "Plastic")
  strength: string;             // Strength value (e.g., "High", "Medium", "100 MPa")
  is_active: boolean;           // Whether the product is active
  is_deprecated: boolean;       // Whether the product is deprecated
  created_at: `${string}T${string}Z`; // ISO 8601 timestamp (e.g., "2025-05-01T08:00:00Z")
  updated_at: `${string}T${string}Z`; // ISO 8601 timestamp
}