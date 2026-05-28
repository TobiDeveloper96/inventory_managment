import type { Category, DashboardReport, Product, StockMovement } from "./types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail));
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getDashboard: () => request<DashboardReport>("/reports/dashboard"),
  listCategories: () => request<Category[]>("/categories"),
  createCategory: (body: { name: string; description?: string }) =>
    request<Category>("/categories", { method: "POST", body: JSON.stringify(body) }),
  deleteCategory: (id: number) =>
    request<void>(`/categories/${id}`, { method: "DELETE" }),
  listProducts: (params?: { search?: string; category_id?: number; low_stock_only?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.category_id != null) q.set("category_id", String(params.category_id));
    if (params?.low_stock_only) q.set("low_stock_only", "true");
    const qs = q.toString();
    return request<Product[]>(`/products${qs ? `?${qs}` : ""}`);
  },
  createProduct: (body: Record<string, unknown>) =>
    request<Product>("/products", { method: "POST", body: JSON.stringify(body) }),
  updateProduct: (id: number, body: Record<string, unknown>) =>
    request<Product>(`/products/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteProduct: (id: number) =>
    request<void>(`/products/${id}`, { method: "DELETE" }),
  recordMovement: (id: number, body: { movement_type: string; quantity: number; note?: string }) =>
    request<StockMovement>(`/products/${id}/movements`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  listMovements: (id: number) => request<StockMovement[]>(`/products/${id}/movements`),
};
