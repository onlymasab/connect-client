

export type ProductModel = {
  product_id: string;
  sku_id: string; // Unique SKU code
  name: string;
  category: string;
  type: string;
  dimensions: string;
  weight: number;
  material: string;
  strength: string;
  current_stock: number;
  minimum_req_stock: number;
  design_file: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  price: number
  product_material: PrecastProductMaterialModel[],
};

export type RawMaterialModel = {
  raw_material_id: string;
  name: string;
  unit?: string;
  cost_per_unit?: number;
  current_stock?: number;
  min_required_stock?: number;
  supplier?: string;
  created_at: string;
  updated_at: string;
};

export type ProductionBatchModel = {
  batch_id: string;
  product_id: string;
  batch_number: string;
  start_date?: string;
  end_date?: string;
  quantity_produced?: number;
  quantity_wasted?: number;
  status : "panding" | "completed" | "halted" | "in_progress",
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type PrecastProductMaterialModel = {
  id: string;
  created_at: string;
  quantity: number;
  unit: string;
  material: {
    name: string;
    raw_material_id: string;
  };
  product: {
    name: string;
    product_id: string;
  };
};

export type RawMaterialUsageModel = {
  usage_id: string;
  batch_id: string;
  raw_material_id: string;
  quantity_used?: number;
  wastage?: number;
  created_at: string;
};

export type StockModel = {
  stock_id: string;
  product_id: string;
  quantity: number;
  location?: string;
  last_updated: string;
};

export type SaleModel = {
  sale_id: string;
  product_id: string;
  customer_name: string;
  quantity: number;
  price: number;
  discount?: number;
  total_amount: number;
  sale_date: string;
  created_at: string;
};

export type DispatchModel = {
  dispatch_id: string;
  sale_id: string;
  dispatch_date?: string;
  vehicle_number?: string;
  driver_name?: string;
  status?: string;
  notes?: string;
  created_at: string;
};

export type InvoiceModel = {
  invoice_id: string;
  sale_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  paid_amount?: number;
  balance_amount?: number;
  status?: string;
  created_at: string;
};

export type ExpenseModel = {
  expense_id: string;
  category: string;
  amount: number;
  description?: string;
  expense_date: string;
  created_at: string;
};

export type StaffModel = {
  staff_id: string;
  name: string;
  role: string;
  salary?: number;
  commission_rate?: number;
  joined_at: string;
  created_at: string;
};

export type SalesmanCommissionModel = {
  commission_id: string;
  staff_id: string;
  sale_id: string;
  commission_amount?: number;
  paid: boolean;
  created_at: string;
};

export type EquipmentMaintenanceModel = {
  maintenance_id: string;
  equipment_name: string;
  maintenance_date: string;
  cost?: number;
  performed_by?: string;
  notes?: string;
  created_at: string;
};

export type LogisticsModel = {
  logistics_id: string;
  dispatch_id: string;
  route?: string;
  estimated_time?: string;
  delivery_status?: string;
  created_at: string;
};

export type QualityControlModel = {
  qc_id: string;
  batch_id: string;
  inspection_date: string;
  inspector?: string;
  passed: boolean;
  remarks?: string;
  created_at: string;
};

export type AuditLogModel = {
  log_id: string;
  user_id?: string;
  action: string;
  table_name: string;
  record_id?: string;
  timestamp: string;
};

export type NotificationModel = {
  notification_id: string;
  user_id?: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};