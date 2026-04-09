export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  image: string | null;
  base_price: number;
  gst_percentage: number;
  hsn_code: string;
  unit: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface BillItem {
  product_id?: number;
  product_name: string;
  hsn_code?: string;
  unit?: string;
  quantity: number;
  base_price: number;
  gst_percentage: number;
  gst_amount?: number;
  total_price?: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_gstin: string;
  subtotal: number;
  total_gst: number;
  total_amount: number;
  notes: string;
  status: 'estimate' | 'invoice';
  created_at: string;
  items?: BillItem[];
}

export interface ShopSettings {
  id: number;
  shop_name: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalInvoices: number;
  totalRevenue: number;
}

export const GST_RATES = [0, 5, 12, 18, 28] as const;
export type GstRate = typeof GST_RATES[number];
