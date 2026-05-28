export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category_id: number | null;
  quantity: number;
  unit_price: string;
  reorder_level: number;
  created_at: string;
  updated_at: string;
  category: Category | null;
  is_low_stock: boolean;
}

export interface StockMovement {
  id: number;
  product_id: number;
  movement_type: "in" | "out" | "adjustment";
  quantity: number;
  note: string | null;
  created_at: string;
}

export interface DashboardReport {
  total_products: number;
  total_units: number;
  inventory_value: string;
  low_stock_count: number;
  category_breakdown: {
    category: string;
    product_count: number;
    total_units: number;
  }[];
  recent_movements: {
    id: number;
    product_name: string;
    movement_type: string;
    quantity: number;
    created_at: string;
  }[];
}
