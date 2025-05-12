export interface ProductModel {
    skuId: string;               // Unique SKU code
    name: string;                // Product name
    category: string;            // Product category
    type: string;                // Specific type or variation
    dimensions: string;          // Dimensions string
    weight: number;              // Weight (kg or tons)
    material: string;            // Material type
    strength: string;            // Strength (MPa)
    isActive: boolean;           // Active status
    isDeprecated: boolean;       // Deprecated status
    createdAt: string;           // ISO timestamp
    updatedAt: string;           // ISO timestamp
  }