export type OrderStatus =
  | "new"
  | "assigned"
  | "confirmed"
  | "in_progress"
  | "done"
  | "cancelled";

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  role: "owner" | "admin" | "dispatcher";
}

export interface Service {
  id: string;
  tenant_id: string;
  name: string;
  description?: string | null;
  base_price: number;
  duration_minutes: number;
  is_active: boolean;
  sort_order: number;
}

export interface Master {
  id: string;
  tenant_id: string;
  telegram_id?: number | null;
  telegram_username?: string | null;
  full_name: string;
  phone?: string | null;
  rating: number;
  completed_orders: number;
  is_active: boolean;
  is_available: boolean;
  invite_token?: string | null;
  activated_at?: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  tenant_id: string;
  telegram_id?: number | null;
  telegram_username?: string | null;
  full_name?: string | null;
  phone?: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  tenant_id: string;
  client_id: string;
  service_id: string;
  master_id?: string | null;
  address_text: string;
  scheduled_at: string;
  status: OrderStatus;
  price: number;
  notes?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
}

export interface DashboardStats {
  orders_new: number;
  orders_in_progress: number;
  orders_done_today: number;
  revenue_today: number;
  active_masters: number;
  total_clients: number;
}
