export type Role = 'super_admin' | 'admin' | 'manager' | 'order_staff' | 'customer';

export interface Address {
  id: string;
  label: 'Home' | 'Office' | 'Other';
  houseNumber: string;
  street: string;
  area: string;
  city: string;
  province: string;
  postalCode: string;
  deliveryInstructions?: string;
  isDefault?: boolean;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  status: 'active' | 'inactive';
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
  ordersCount?: number;
  totalSpent?: number;
}

export interface PizzaSizes {
  small: number;
  medium: number;
  large: number;
}

export interface PizzaRecipe {
  flourGrams: number;
  cheeseGrams: number;
  chickenGrams: number;
  sauceGrams: number;
  veggieGrams: number;
  boxUnit: string;
}

export interface Pizza {
  _id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  categoryId?: string;
  image: string;
  price?: number;
  hasSizes?: boolean;
  sizes: PizzaSizes;
  ingredients: string[];
  recipes?: {
    Small: PizzaRecipe;
    Medium: PizzaRecipe;
    Large: PizzaRecipe;
  };
  isAvailable: boolean;
  prepTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export type FoodItem = Pizza;

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  displayOrder: number;
  isActive?: boolean;
}

export interface CartItem {
  pizza: Pizza;
  size: 'Small' | 'Medium' | 'Large' | 'Regular' | 'Single';
  quantity: number;
  unitPrice: number;
}

export type InventoryCategory = 'Dough & Flour' | 'Dairy' | 'Meat' | 'Produce' | 'Sauce' | 'Packaging';

export interface InventoryItem {
  _id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  stockQuantity: number;
  unit: 'kg' | 'grams' | 'liters' | 'pcs';
  minStockLevel: number;
  purchaseCost: number;
  supplierId: string;
  supplierName: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  _id: string;
  itemId: string;
  itemName: string;
  type: 'RESTOCK' | 'ORDER_DEDUCTION' | 'CANCELLATION_RESTORE' | 'MANUAL_ADJUSTMENT';
  quantity: number;
  unit: string;
  previousStock: number;
  newStock: number;
  referenceOrderId?: string;
  reason?: string;
  performedBy: string;
  timestamp: string;
}

export interface Supplier {
  _id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  suppliedCategories: string[];
  isActive: boolean;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validUntil: string;
  isActive: boolean;
  usageCount: number;
}

export interface OrderItem {
  pizzaId: string;
  sku: string;
  name: string;
  category: string;
  image?: string;
  size: 'Small' | 'Medium' | 'Large' | 'Regular' | 'Single';
  quantity: number;
  unitPrice: number;
  itemTotal: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready for Pickup'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  updatedBy: string;
  note?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: Address;
  orderNotes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  discountAmount: number;
  couponCode?: string;
  grandTotal: number;
  paymentMethod: 'Cash on Delivery' | 'Bank Transfer' | 'Online Payment';
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  orderStatus: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  cancellationReason?: string;
  inventoryDeducted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  totalPizzas: number;
  lowStockCount: number;
  lowStockItems: InventoryItem[];
  popularPizzas: { name: string; count: number; revenue: number }[];
}
