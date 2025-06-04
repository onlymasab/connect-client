import { z } from "zod";

// Common ISO 8601 date/time regex
const usDateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d+$/;

// --- Product ---
export const ProductSchema = z.object({
  product_id: z.string().uuid(),
  sku_id: z.string()
    .regex(/^SKU\d{4}$/, "SKU ID must be in the format 'SKU0001'"),
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  type: z.string().min(1, "Type is required"),
  dimensions: z.string().min(0, "Weight must be non-negative"),
  weight: z.number().nonnegative().min(0, "Weight must be non-negative"),
  material: z.string().min(1, "Material is required"),
  strength: z.string().min(1, "Strength is required"),
  design_file: z.string().min(1, "Design File is required"),
  current_stock: z.number().nonnegative().min(0, "Stock must be non-negative"),
  minimum_req_stock: z.number().nonnegative().min(0, "Minimum Stock must be non-negative"),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

// --- Raw Material ---
export const RawMaterialSchema = z.object({
  raw_material_id: z.string().uuid(),
  name: z.string().min(1),
  unit: z.string().optional(),
  cost_per_unit: z.number().nonnegative().optional(),
  current_stock: z.number().nonnegative().optional(),
  min_required_stock: z.number().nonnegative().optional(),
  supplier: z.string().optional(),
  created_at: z.string(), // ← accepts ISO format
  updated_at: z.string(),
});

// --- Production Batch ---
export const ProductionBatchSchema = z.object({
  batch_id: z.string().uuid(),
  product_id: z.string().uuid(),
  batch_number: z.string().min(1),
  start_date: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
  end_date: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
  quantity_produced: z.number().nonnegative().optional(),
  quantity_wasted: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  created_at: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
  updated_at: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
});

// --- Raw Material Usage ---
export const RawMaterialUsageSchema = z.object({
  usage_id: z.string().uuid(),
  batch_id: z.string().uuid(),
  raw_material_id: z.string().uuid(),
  quantity_used: z.number().nonnegative().optional(),
  wastage: z.number().nonnegative().optional(),
  created_at: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
});

// --- Stock ---
export const StockSchema = z.object({
  stock_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().nonnegative(),
  location: z.string().optional(),
  last_updated: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
});

// --- Sale ---
export const SaleSchema = z.object({
  sale_id: z.string().uuid(),
  product_id: z.string().uuid(),
  customer_name: z.string().min(1),
  quantity: z.number().positive(),
  price: z.number().nonnegative(),
  discount: z.number().nonnegative().optional(),
  total_amount: z.number().nonnegative(),
  sale_date: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
  created_at: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
});

// --- Dispatch ---
export const DispatchSchema = z.object({
  dispatch_id: z.string().uuid(),
  sale_id: z.string().uuid(),
  dispatch_date: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
  vehicle_number: z.string().optional(),
  driver_name: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  created_at: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
});

// --- Invoice ---
export const InvoiceSchema = z.object({
  invoice_id: z.string().uuid(),
  sale_id: z.string().uuid(),
  invoice_number: z.string().min(1),
  invoice_date: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
  due_date: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
  paid_amount: z.number().nonnegative().optional(),
  balance_amount: z.number().nonnegative().optional(),
  status: z.string().optional(),
  created_at: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
});

// --- Expense ---
export const ExpenseSchema = z.object({
  expense_id: z.string().uuid(),
  category: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().optional(),
  expense_date: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
  created_at: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
});

// --- Staff ---
export const StaffSchema = z.object({
  staff_id: z.string().uuid(),
  name: z.string().min(1),
  role: z.string().min(1),
  salary: z.number().nonnegative().optional(),
  commission_rate: z.number().nonnegative().optional(),
  joined_at: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
  created_at: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
});

// --- Salesman Commission ---
export const SalesmanCommissionSchema = z.object({
  commission_id: z.string().uuid(),
  staff_id: z.string().uuid(),
  sale_id: z.string().uuid(),
  commission_amount: z.number().nonnegative().optional(),
  paid: z.boolean(),
  created_at: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
});

// --- Equipment Maintenance ---
export const EquipmentMaintenanceSchema = z.object({
  maintenance_id: z.string().uuid(),
  equipment_name: z.string().min(1),
  maintenance_date: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
  cost: z.number().nonnegative().optional(),
  performed_by: z.string().optional(),
  notes: z.string().optional(),
  created_at: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
});

// --- Logistics ---
export const LogisticsSchema = z.object({
  logistics_id: z.string().uuid(),
  dispatch_id: z.string().uuid(),
  route: z.string().optional(),
  estimated_time: z.string().optional(),
  delivery_status: z.string().optional(),
  created_at: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
});

// --- Quality Control ---
export const QualityControlSchema = z.object({
  qc_id: z.string().uuid(),
  batch_id: z.string().uuid(),
  inspection_date: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
  inspector: z.string().optional(),
  passed: z.boolean(),
  remarks: z.string().optional(),
  created_at: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
});

// --- Audit Log ---
export const AuditLogSchema = z.object({
  log_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  action: z.string().min(1),
  table_name: z.string().min(1),
  record_id: z.string().uuid().optional(),
  timestamp: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
});

// --- Notification ---
export const NotificationSchema = z.object({
  notification_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  title: z.string().min(1),
  message: z.string().min(1),
  is_read: z.boolean(),
  created_at: z.string().regex(usDateRegex, "Invalid date format, expected MM/DD/YYYY, HH:MM:SS AM/PM"),
});





// Now if you want to combine all schemas into a single "DataSchema" object:
export const DataSchema = z.object({
  products: z.array(ProductSchema),
  rawMaterials: z.array(RawMaterialSchema),
  productionBatches: z.array(ProductionBatchSchema),
  rawMaterialUsages: z.array(RawMaterialUsageSchema),
  stocks: z.array(StockSchema),
  sales: z.array(SaleSchema),
  dispatches: z.array(DispatchSchema),
  invoices: z.array(InvoiceSchema),
  expenses: z.array(ExpenseSchema),
  staff: z.array(StaffSchema),
  salesmanCommissions: z.array(SalesmanCommissionSchema),
  equipmentMaintenances: z.array(EquipmentMaintenanceSchema),
  logistics: z.array(LogisticsSchema),
  qualityControls: z.array(QualityControlSchema),
  auditLogs: z.array(AuditLogSchema),
  notifications: z.array(NotificationSchema),
  // add other arrays of schemas here...
});

// Type for entire dataset
export type DataSchema = z.infer<typeof DataSchema>;