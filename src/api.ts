import {
  Pizza,
  Category,
  Order,
  OrderStatus,
  User,
  Coupon,
  InventoryItem,
  InventoryTransaction,
  Supplier,
  DashboardStats
} from './types';

const BASE_URL = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const api = {
  // Auth
  register: (payload: any) => request<{ success: boolean; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: any) => request<{ success: boolean; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getUser: (id: string) => request<{ success: boolean; user: User }>(`/auth/user/${id}`),
  updateProfile: (id: string, payload: any) => request<{ success: boolean; user: User }>(`/auth/profile/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  changePassword: (id: string, payload: any) => request<{ success: boolean; message: string }>(`/auth/change-password/${id}`, { method: 'POST', body: JSON.stringify(payload) }),
  addAddress: (userId: string, payload: any) => request<{ success: boolean; addresses: any[] }>(`/auth/addresses/${userId}`, { method: 'POST', body: JSON.stringify(payload) }),
  deleteAddress: (userId: string, addressId: string) => request<{ success: boolean; addresses: any[] }>(`/auth/addresses/${userId}/${addressId}`, { method: 'DELETE' }),

  // Pizzas
  getPizzas: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    return request<{ success: boolean; pizzas: Pizza[] }>(`/pizzas?${params.toString()}`);
  },
  getPizza: (id: string) => request<{ success: boolean; pizza: Pizza }>(`/pizzas/${id}`),
  createPizza: (payload: any) => request<{ success: boolean; pizza: Pizza }>('/pizzas', { method: 'POST', body: JSON.stringify(payload) }),
  updatePizza: (id: string, payload: any) => request<{ success: boolean; pizza: Pizza }>(`/pizzas/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deletePizza: (id: string) => request<{ success: boolean; message: string }>(`/pizzas/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request<{ success: boolean; categories: Category[] }>('/categories'),
  createCategory: (payload: any) => request<{ success: boolean; category: Category }>('/categories', { method: 'POST', body: JSON.stringify(payload) }),
  updateCategory: (id: string, payload: any) => request<{ success: boolean; category: Category }>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteCategory: (id: string) => request<{ success: boolean; message: string }>(`/categories/${id}`, { method: 'DELETE' }),
  toggleCategory: (id: string) => request<{ success: boolean; category: Category }>(`/categories/${id}/toggle`, { method: 'PATCH' }),

  // Coupons
  validateCoupon: (code: string, subtotal: number) => request<{ success: boolean; code: string; discountAmount: number; discountType: string; discountValue: number }>(`/coupons/validate?code=${encodeURIComponent(code)}&subtotal=${subtotal}`),
  getCoupons: () => request<{ success: boolean; coupons: Coupon[] }>('/coupons'),
  createCoupon: (payload: any) => request<{ success: boolean; coupon: Coupon }>('/coupons', { method: 'POST', body: JSON.stringify(payload) }),

  // Orders
  createOrder: (payload: any) => request<{ success: boolean; order: Order }>('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getMyOrders: (customerId: string) => request<{ success: boolean; orders: Order[] }>(`/orders/my-orders?customerId=${customerId}`),
  getOrder: (id: string) => request<{ success: boolean; order: Order }>(`/orders/${id}`),
  cancelOrder: (id: string, reason?: string, performedBy?: string) => request<{ success: boolean; order: Order; message: string }>(`/orders/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason, performedBy }) }),

  // Admin
  getStats: () => request<{ success: boolean; stats: DashboardStats }>('/admin/stats'),
  getAdminOrders: (status?: string, search?: string, date?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    if (date) params.append('date', date);
    return request<{ success: boolean; orders: Order[] }>(`/admin/orders?${params.toString()}`);
  },
  updateOrderStatus: (id: string, payload: { newStatus: OrderStatus; updatedBy: string; note?: string; cancellationReason?: string }) =>
    request<{ success: boolean; order: Order; deductionSummary?: string[] }>(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),

  getInventory: () => request<{ success: boolean; inventory: InventoryItem[]; transactions: InventoryTransaction[] }>('/admin/inventory'),
  restockInventory: (payload: any) => request<{ success: boolean; item: InventoryItem; transaction: InventoryTransaction }>('/admin/inventory/restock', { method: 'POST', body: JSON.stringify(payload) }),
  getInventoryTransactions: () => request<{ success: boolean; transactions: InventoryTransaction[] }>('/admin/inventory/transactions'),

  getSuppliers: () => request<{ success: boolean; suppliers: Supplier[] }>('/admin/suppliers'),
  createSupplier: (payload: any) => request<{ success: boolean; supplier: Supplier }>('/admin/suppliers', { method: 'POST', body: JSON.stringify(payload) }),

  getCustomers: () => request<{ success: boolean; customers: User[] }>('/admin/customers'),
  toggleCustomerStatus: (id: string, status: 'active' | 'inactive') => request<{ success: boolean; user: User }>(`/admin/customers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  getStaff: () => request<{ success: boolean; staff: User[] }>('/admin/staff'),
  createStaff: (payload: any) => request<{ success: boolean; staff: User }>('/admin/staff', { method: 'POST', body: JSON.stringify(payload) }),

  resetSystem: () => request<{ success: boolean; message: string }>('/admin/system/reset', { method: 'POST' }),
  exportZipUrl: '/api/admin/system/export-zip',

  // Image Upload & Permanent Storage
  uploadProductImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to upload product image');
    }
    return data as {
      success: boolean;
      imageUrl: string;
      filename: string;
      size: number;
      message: string;
    };
  },

  deleteProductImage: (filename: string) =>
    request<{ success: boolean; message: string }>(`/upload/${encodeURIComponent(filename)}`, { method: 'DELETE' })
};
