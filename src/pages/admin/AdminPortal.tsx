import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Pizza as PizzaIcon,
  Boxes,
  Users,
  Shield,
  Tag,
  Download,
  RotateCcw,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Printer,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  Building2,
  Trash2,
  Edit3
} from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  Order,
  OrderStatus,
  Pizza,
  Category,
  InventoryItem,
  InventoryTransaction,
  Supplier,
  User,
  Coupon,
  DashboardStats
} from '../../types';
import { OrderInvoiceModal } from '../../components/OrderInvoiceModal';

interface AdminPortalProps {
  setCurrentView: (view: string) => void;
  onRefreshData?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ setCurrentView, onRefreshData }) => {
  const { user, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'categories' | 'menu' | 'inventory' | 'customers' | 'staff' | 'coupons' | 'system'>('overview');

  // Stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('All');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Cancel Order Modal
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Customer called to cancel');

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '🍔',
    displayOrder: 1,
    isActive: true
  });

  // Menu Pizzas & Food Items
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [foodCategoryFilter, setFoodCategoryFilter] = useState<string>('All');
  const [foodSearch, setFoodSearch] = useState<string>('');
  const [showPizzaModal, setShowPizzaModal] = useState(false);
  const [editingPizza, setEditingPizza] = useState<Pizza | null>(null);
  const [pizzaForm, setPizzaForm] = useState({
    sku: '',
    name: '',
    description: '',
    category: 'Pizza',
    categoryId: '',
    image: '',
    hasSizes: true,
    price: 799,
    smallPrice: 799,
    mediumPrice: 1199,
    largePrice: 1699,
    prepTime: 20,
    ingredients: 'Chicken, Mozzarella, Sauce'
  });

  // Inventory
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [restockModalItem, setRestockModalItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);
  const [restockCost, setRestockCost] = useState<number>(0);
  const [restockReason, setRestockReason] = useState('Routine supplier delivery');

  // Suppliers
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactPerson: '',
    phone: '+92',
    email: '',
    address: '',
    category: 'Dairy'
  });

  // Customers
  const [customers, setCustomers] = useState<User[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');

  // Staff
  const [staffList, setStaffList] = useState<User[]>([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({
    fullName: '',
    email: '',
    phone: '+923',
    role: 'order_staff',
    password: ''
  });

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderAmount: 1500,
    maxDiscount: 400
  });

  // Toast message
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Initial Data Fetch
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoadingStats(true);
    try {
      const [st, ord, piz, cats, inv, sup, cust, stf, coup] = await Promise.all([
        api.getStats(),
        api.getAdminOrders(),
        api.getPizzas(),
        api.getCategories(),
        api.getInventory(),
        api.getSuppliers(),
        api.getCustomers(),
        api.getStaff(),
        api.getCoupons()
      ]);

      setStats(st.stats);
      setOrders(ord.orders);
      setPizzas(piz.pizzas);
      setCategories(cats.categories);
      setInventory(inv.inventory);
      setTransactions(inv.transactions);
      setSuppliers(sup.suppliers);
      setCustomers(cust.customers);
      setStaffList(stf.staff);
      setCoupons(coup.coupons);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Category CRUD Handlers
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const res = await api.updateCategory(editingCategory._id, categoryForm);
        setCategories(prev => prev.map(c => c._id === editingCategory._id ? res.category : c));
        showToast(`Category "${res.category.name}" updated successfully!`);
      } else {
        const res = await api.createCategory(categoryForm);
        setCategories(prev => [...prev, res.category]);
        showToast(`New category "${res.category.name}" created!`);
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to save category');
    }
  };

  const handleToggleCategory = async (cat: Category) => {
    try {
      const res = await api.toggleCategory(cat._id);
      setCategories(prev => prev.map(c => c._id === cat._id ? res.category : c));
      showToast(`Category "${cat.name}" is now ${res.category.isActive ? 'Active' : 'Deactivated'}.`);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle category');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"? Existing menu items under this category will remain preserved.`)) return;
    try {
      await api.deleteCategory(id);
      setCategories(prev => prev.filter(c => c._id !== id));
      showToast(`Category "${name}" deleted.`);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  // Status transitions
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, {
        newStatus,
        updatedBy: user?.fullName || 'Staff'
      });

      // Update in local state
      setOrders(prev => prev.map(o => (o._id === orderId ? res.order : o)));
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(res.order);
      }

      // Refresh stats & inventory if ingredients were deducted
      const st = await api.getStats();
      setStats(st.stats);
      const inv = await api.getInventory();
      setInventory(inv.inventory);
      setTransactions(inv.transactions);

      if (res.deductionSummary && res.deductionSummary.length > 0) {
        showToast(`Status updated to "${newStatus}". Recipe ingredients automatically deducted!`);
      } else {
        showToast(`Order status updated to "${newStatus}".`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleConfirmCancelOrder = async () => {
    if (!cancelModalOrder) return;
    try {
      const res = await api.updateOrderStatus(cancelModalOrder._id, {
        newStatus: 'Cancelled',
        updatedBy: user?.fullName || 'Staff Member',
        cancellationReason: cancelReason
      });

      setOrders(prev => prev.map(o => (o._id === cancelModalOrder._id ? res.order : o)));
      if (selectedOrder?._id === cancelModalOrder._id) {
        setSelectedOrder(res.order);
      }

      setCancelModalOrder(null);
      // Refresh inventory and stats
      const [st, inv] = await Promise.all([api.getStats(), api.getInventory()]);
      setStats(st.stats);
      setInventory(inv.inventory);
      setTransactions(inv.transactions);

      showToast(`Order ${res.order.orderNumber} cancelled. Ingredients restored if previously deducted.`);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order.');
    }
  };

  // Restock handler
  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalItem) return;
    try {
      const res = await api.restockInventory({
        itemId: restockModalItem._id,
        quantity: restockQty,
        costPerUnit: restockCost,
        performedBy: user?.fullName || 'Staff',
        reason: restockReason
      });

      setInventory(prev => prev.map(i => (i._id === res.item._id ? res.item : i)));
      setTransactions(prev => [res.transaction, ...prev]);
      setRestockModalItem(null);
      showToast(`Restocked ${restockQty} ${res.item.unit} of ${res.item.name}!`);
    } catch (err: any) {
      alert(err.message || 'Restock failed');
    }
  };

  // Food Item / Pizza CRUD
  const handleSavePizza = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const singlePrice = Number(pizzaForm.price) || Number(pizzaForm.mediumPrice) || 0;
      const matchedCat = categories.find(c => c.name.toLowerCase() === pizzaForm.category.toLowerCase() || c._id === pizzaForm.categoryId);

      const payload = {
        sku: pizzaForm.sku.trim().toUpperCase(),
        name: pizzaForm.name.trim(),
        description: pizzaForm.description,
        category: pizzaForm.category,
        categoryId: matchedCat?._id || pizzaForm.categoryId || undefined,
        image: pizzaForm.image.trim() || '/src/assets/images/pizza_chicken_tikka_1794214328353.jpg',
        hasSizes: pizzaForm.hasSizes,
        price: singlePrice,
        sizes: pizzaForm.hasSizes ? {
          small: Number(pizzaForm.smallPrice),
          medium: Number(pizzaForm.mediumPrice),
          large: Number(pizzaForm.largePrice)
        } : {
          small: singlePrice,
          medium: singlePrice,
          large: singlePrice
        },
        prepTimeMinutes: Number(pizzaForm.prepTime) || 15,
        ingredients: pizzaForm.ingredients.split(',').map(s => s.trim()).filter(Boolean)
      };

      if (editingPizza) {
        const res = await api.updatePizza(editingPizza._id, payload);
        setPizzas(prev => prev.map(p => (p._id === editingPizza._id ? res.pizza : p)));
        showToast(`Item "${res.pizza.name}" updated successfully!`);
      } else {
        const res = await api.createPizza(payload);
        setPizzas(prev => [...prev, res.pizza]);
        showToast(`New item "${res.pizza.name}" added to menu!`);
      }

      setShowPizzaModal(false);
      setEditingPizza(null);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to save item');
    }
  };

  const handleTogglePizzaAvailability = async (pizza: Pizza) => {
    try {
      const res = await api.updatePizza(pizza._id, { isAvailable: !pizza.isAvailable });
      setPizzas(prev => prev.map(p => (p._id === pizza._id ? res.pizza : p)));
      showToast(`${pizza.name} is now ${res.pizza.isAvailable ? 'AVAILABLE' : 'MARKED SOLD OUT'}.`);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle availability');
    }
  };

  const handleDeletePizza = async (id: string, name?: string) => {
    if (!confirm(`Are you sure you want to delete ${name || 'this item'} from the menu?`)) return;
    try {
      await api.deletePizza(id);
      setPizzas(prev => prev.filter(p => p._id !== id));
      showToast('Item deleted from menu.');
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete food item');
    }
  };

  // Reset System Data
  const handleResetSystem = async () => {
    if (!confirm('Are you sure you want to reset all data back to the default Pakistani restaurant seed data? All custom entries will be restored to clean state.')) return;
    try {
      await api.resetSystem();
      await fetchAllData();
      showToast('Database reset to clean Pakistani restaurant seed data!');
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Reset failed');
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    if (orderFilterStatus !== 'All' && o.orderStatus !== orderFilterStatus) return false;
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-stone-700 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Admin Top Bar */}
      <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-lg font-black">
              🍕
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">
                Pizza House · Administration
              </span>
              <span className="ml-2 text-xs font-mono text-amber-400 font-semibold uppercase">
                [{user?.role.replace('_', ' ')}]
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('home')}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg text-xs font-medium transition"
            >
              ← Back to Customer Website
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-bar */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto py-2 scrollbar-none text-xs font-medium">
          {[
            { id: 'overview', label: 'Executive Dashboard', icon: LayoutDashboard },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
            { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
            { id: 'menu', label: `Food Catalog (${pizzas.length})`, icon: PizzaIcon },
            { id: 'inventory', label: `Inventory & Recipes (${inventory.length})`, icon: Boxes },
            { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
            { id: 'staff', label: 'Staff & Roles', icon: Shield },
            { id: 'coupons', label: 'Promo Coupons', icon: Tag },
            { id: 'system', label: 'System & Backup', icon: RotateCcw }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition ${
                  active
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* 1. OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Total Revenue
                </span>
                <span className="text-lg font-black text-stone-900 font-mono tabular-nums block mt-1">
                  PKR {stats.totalRevenue.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Excl. Cancelled</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Today's Revenue
                </span>
                <span className="text-lg font-black text-amber-600 font-mono tabular-nums block mt-1">
                  PKR {stats.todayRevenue.toLocaleString()}
                </span>
                <span className="text-[10px] text-stone-500 font-medium">{stats.todayOrders} orders today</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Total Orders
                </span>
                <span className="text-lg font-black text-stone-900 font-mono tabular-nums block mt-1">
                  {stats.totalOrders}
                </span>
                <span className="text-[10px] text-stone-500 font-medium">All-time count</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                  Pending Orders
                </span>
                <span className="text-lg font-black text-amber-600 font-mono tabular-nums block mt-1">
                  {stats.pendingOrders}
                </span>
                <span className="text-[10px] text-amber-700 font-semibold">Requires acceptance</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  In Oven / Prep
                </span>
                <span className="text-lg font-black text-sky-600 font-mono tabular-nums block mt-1">
                  {stats.preparingOrders}
                </span>
                <span className="text-[10px] text-stone-500 font-medium">Kitchen active</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Low Stock Items
                </span>
                <span className="text-lg font-black text-red-600 font-mono tabular-nums block mt-1">
                  {stats.lowStockCount}
                </span>
                <span className="text-[10px] text-red-600 font-medium">Below threshold</span>
              </div>
            </div>

            {/* Low Stock Alert Strip if any */}
            {stats.lowStockCount > 0 && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-red-900">
                      Low-Stock Warning: {stats.lowStockCount} Raw Ingredients Below Safety Threshold
                    </h4>
                    <p className="text-[11px] text-red-700 mt-0.5">
                      {stats.lowStockItems.map(i => `${i.name} (${i.stockQuantity} ${i.unit})`).join(', ')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition whitespace-nowrap"
                >
                  Go to Restock
                </button>
              </div>
            )}

            {/* Two Column Layout: Recent Orders & Popular Pizzas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Recent Orders (7 cols) */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                    Recent Live Orders
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-amber-600 hover:underline font-semibold"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="divide-y divide-stone-100">
                  {orders.slice(0, 5).map(o => (
                    <div key={o._id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold font-mono text-stone-900">{o.orderNumber}</span>
                          <span className="text-stone-400">·</span>
                          <span className="font-medium text-stone-700">{o.customerName}</span>
                          <span className="text-stone-400">·</span>
                          <span className="font-mono text-stone-500">{o.customerPhone}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {o.items.map(it => `${it.quantity}x ${it.name} (${it.size})`).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono tabular-nums font-bold text-stone-900">
                          PKR {o.grandTotal.toLocaleString()}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            o.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.orderStatus === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {o.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Top Pizzas & Revenue Leaders (5 cols) */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">
                  Top Selling Pakistani Pizzas
                </h3>

                <div className="space-y-3">
                  {stats.popularPizzas.slice(0, 6).map((pop, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-stone-50">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-stone-900">{pop.name}</p>
                          <p className="text-[11px] text-stone-500">{pop.count} pizzas sold</p>
                        </div>
                      </div>

                      <span className="font-mono tabular-nums font-extrabold text-amber-700">
                        PKR {pop.revenue.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-base font-bold text-stone-900">Commercial Order Management</h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Search by order number or customer phone, verify delivery addresses, and advance kitchen workflow.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search order #, customer, phone..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-stone-100 scrollbar-none text-xs">
                {['All', 'Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium ${
                      orderFilterStatus === st
                        ? 'bg-stone-900 text-white font-bold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px] font-semibold">
                      <th className="py-2.5">Order #</th>
                      <th className="py-2.5">Customer & Phone</th>
                      <th className="py-2.5">Destination</th>
                      <th className="py-2.5">Items Summary</th>
                      <th className="py-2.5 text-right">Amount (PKR)</th>
                      <th className="py-2.5 text-center">Status</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredOrders.map((o) => (
                      <tr key={o._id} className="hover:bg-stone-50 transition">
                        <td className="py-3 font-mono font-bold text-stone-900">
                          {o.orderNumber}
                        </td>
                        <td className="py-3">
                          <p className="font-bold text-stone-900">{o.customerName}</p>
                          <p className="text-[11px] text-stone-500 font-mono">{o.customerPhone}</p>
                        </td>
                        <td className="py-3">
                          <p className="text-stone-800 font-medium truncate max-w-[160px]">{o.deliveryAddress.area}, {o.deliveryAddress.city}</p>
                          <p className="text-[10px] text-stone-400">{o.paymentMethod}</p>
                        </td>
                        <td className="py-3">
                          <p className="text-stone-700 truncate max-w-[200px]">
                            {o.items.map(it => `${it.quantity}x ${it.name} (${it.size})`).join(', ')}
                          </p>
                        </td>
                        <td className="py-3 text-right font-mono tabular-nums font-extrabold text-stone-900">
                          {o.grandTotal.toLocaleString()}
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              o.orderStatus === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : o.orderStatus === 'Cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedOrder(o)}
                              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-semibold transition"
                            >
                              Manage
                            </button>
                            <button
                              onClick={() => setInvoiceOrder(o)}
                              className="p-1 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded transition"
                              title="Print Commercial Tax Invoice"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Manage Order Drawer / Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center pb-4 border-b border-stone-200 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-stone-900">
                        Order Details · {selectedOrder.orderNumber}
                      </h3>
                      <p className="text-xs text-stone-500">
                        Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Status Progression Controls */}
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-5">
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                      Advance Kitchen & Delivery Status:
                    </label>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {selectedOrder.orderStatus === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(selectedOrder._id, 'Confirmed')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition shadow-xs"
                          >
                            ✓ Confirm Order (Deducts Recipe Ingredients)
                          </button>
                          <button
                            onClick={() => {
                              setCancelModalOrder(selectedOrder);
                              setSelectedOrder(null);
                            }}
                            className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-semibold transition"
                          >
                            Reject / Cancel
                          </button>
                        </>
                      )}

                      {selectedOrder.orderStatus === 'Confirmed' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(selectedOrder._id, 'Preparing')}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold transition shadow-xs"
                          >
                            🍕 Send to Stone Oven (Preparing)
                          </button>
                          <button
                            onClick={() => {
                              setCancelModalOrder(selectedOrder);
                              setSelectedOrder(null);
                            }}
                            className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-semibold transition"
                          >
                            Cancel Order
                          </button>
                        </>
                      )}

                      {selectedOrder.orderStatus === 'Preparing' && (
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, 'Ready for Pickup')}
                          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold transition shadow-xs"
                        >
                          📦 Mark Ready for Pickup / Dispatch
                        </button>
                      )}

                      {selectedOrder.orderStatus === 'Ready for Pickup' && (
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, 'Out for Delivery')}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition shadow-xs"
                        >
                          🛵 Hand to Rider (Out for Delivery)
                        </button>
                      )}

                      {selectedOrder.orderStatus === 'Out for Delivery' && (
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, 'Delivered')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition shadow-xs"
                        >
                          ✓ Confirm Delivered & Paid
                        </button>
                      )}

                      {(selectedOrder.orderStatus === 'Delivered' || selectedOrder.orderStatus === 'Cancelled') && (
                        <span className="text-xs font-semibold text-stone-500 italic">
                          This order is in terminal state ({selectedOrder.orderStatus}).
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer & Address Details */}
                  <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                    <div>
                      <span className="text-stone-400 font-semibold block uppercase text-[10px]">Customer:</span>
                      <p className="font-bold text-stone-900">{selectedOrder.customerName}</p>
                      <p className="font-mono text-stone-600">{selectedOrder.customerPhone}</p>
                      <p className="text-stone-500">{selectedOrder.customerEmail}</p>
                    </div>

                    <div>
                      <span className="text-stone-400 font-semibold block uppercase text-[10px]">Address:</span>
                      <p className="font-medium text-stone-800">{selectedOrder.deliveryAddress.houseNumber}, {selectedOrder.deliveryAddress.street}</p>
                      <p className="text-stone-600">{selectedOrder.deliveryAddress.area}, {selectedOrder.deliveryAddress.city}</p>
                      {selectedOrder.deliveryAddress.deliveryInstructions && (
                        <p className="text-[11px] text-amber-800 mt-1 italic">
                          Note: "{selectedOrder.deliveryAddress.deliveryInstructions}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="text-xs space-y-2 mb-4">
                    <span className="text-stone-400 font-semibold block uppercase text-[10px]">Pizzas Ordered:</span>
                    {selectedOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between p-2 bg-stone-50 rounded-lg">
                        <div>
                          <span className="font-bold text-stone-900">{it.name}</span>
                          <span className="text-stone-500 block text-[11px]">
                            {it.size} · Qty: {it.quantity} @ PKR {it.unitPrice.toLocaleString()}
                          </span>
                        </div>
                        <span className="font-mono tabular-nums font-bold text-stone-900">
                          PKR {it.itemTotal.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Notes */}
                  {selectedOrder.orderNotes && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs mb-4 text-amber-900">
                      <span className="font-bold block">Customer Kitchen Note:</span>
                      "{selectedOrder.orderNotes}"
                    </div>
                  )}

                  {/* Status History */}
                  <div className="pt-3 border-t border-stone-200 text-xs">
                    <span className="text-stone-400 font-semibold block uppercase text-[10px] mb-2">Audit History:</span>
                    <div className="space-y-1.5">
                      {selectedOrder.statusHistory.map((sh, idx) => (
                        <div key={idx} className="flex justify-between text-stone-600 text-[11px]">
                          <span>
                            <strong className="text-stone-800">{sh.status}</strong> by {sh.updatedBy}
                            {sh.note && ` (${sh.note})`}
                          </span>
                          <span className="font-mono text-stone-400">
                            {new Date(sh.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setInvoiceOrder(selectedOrder);
                        setSelectedOrder(null);
                      }}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Tax Invoice</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CATEGORIES MANAGEMENT TAB */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-base font-bold text-stone-900">Food Categories Management</h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Manage all 14 restaurant fast-food categories or dynamically add new categories to the customer menu.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({
                      name: '',
                      slug: '',
                      description: '',
                      image: '🍔',
                      displayOrder: categories.length + 1,
                      isActive: true
                    });
                    setShowCategoryModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Category</span>
                </button>
              </div>

              {/* Category Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px] font-semibold">
                      <th className="py-2.5">Order</th>
                      <th className="py-2.5">Icon / Image</th>
                      <th className="py-2.5">Category Name</th>
                      <th className="py-2.5">Slug</th>
                      <th className="py-2.5">Description</th>
                      <th className="py-2.5 text-center">Items Count</th>
                      <th className="py-2.5 text-center">Status</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {categories.map((cat, idx) => {
                      const count = pizzas.filter(p => p.category.toLowerCase() === cat.name.toLowerCase() || p.categoryId === cat._id).length;
                      return (
                        <tr key={cat._id || idx} className="hover:bg-stone-50 transition">
                          <td className="py-3 font-mono font-bold text-stone-500">#{cat.displayOrder || idx + 1}</td>
                          <td className="py-3">
                            <span className="text-2xl p-1 bg-stone-100 rounded-lg inline-block">{cat.image || '🍕'}</span>
                          </td>
                          <td className="py-3 font-bold text-stone-900">{cat.name}</td>
                          <td className="py-3 font-mono text-stone-500 text-[11px]">{cat.slug}</td>
                          <td className="py-3 text-stone-600 max-w-xs truncate">{cat.description || '—'}</td>
                          <td className="py-3 text-center">
                            <span className="inline-block px-2.5 py-0.5 bg-stone-100 text-stone-800 rounded-full font-mono font-semibold">
                              {count}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => handleToggleCategory(cat)}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition ${
                                cat.isActive !== false
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                              }`}
                            >
                              {cat.isActive !== false ? 'Active' : 'Deactivated'}
                            </button>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingCategory(cat);
                                  setCategoryForm({
                                    name: cat.name,
                                    slug: cat.slug,
                                    description: cat.description || '',
                                    image: cat.image || '🍕',
                                    displayOrder: cat.displayOrder || idx + 1,
                                    isActive: cat.isActive !== false
                                  });
                                  setShowCategoryModal(true);
                                }}
                                className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                                title="Edit Category"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat._id, cat.name)}
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Modal */}
            {showCategoryModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
                  <h3 className="text-base font-bold text-stone-900 mb-4">
                    {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Fast Food Category'}
                  </h3>

                  <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Category Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Shawarma, Wraps, Burgers"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Slug (URL identifier)</label>
                        <input
                          type="text"
                          placeholder="auto-generated from name"
                          value={categoryForm.slug}
                          onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono lowercase"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Emoji / Icon / Image</label>
                        <input
                          type="text"
                          placeholder="e.g. 🍔 or URL"
                          value={categoryForm.image}
                          onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-center text-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Display Order</label>
                      <input
                        type="number"
                        min="1"
                        value={categoryForm.displayOrder}
                        onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Description</label>
                      <textarea
                        rows={2}
                        placeholder="Short description of this category"
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="cat-active-checkbox"
                        checked={categoryForm.isActive}
                        onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <label htmlFor="cat-active-checkbox" className="font-semibold text-stone-700">
                        Category is active on customer website
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
                      <button
                        type="button"
                        onClick={() => setShowCategoryModal(false)}
                        className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold"
                      >
                        {editingCategory ? 'Update Category' : 'Create Category'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. FOOD CATALOG & PRICING MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-base font-bold text-stone-900">Food Menu & Pricing Control</h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Manage fast-food items, update PKR prices, toggle sizes/portions, and control live availability.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingPizza(null);
                    setPizzaForm({
                      sku: `PH-ITM-0${pizzas.length + 1}`,
                      name: '',
                      description: '',
                      category: categories[0]?.name || 'Pizza',
                      categoryId: categories[0]?._id || '',
                      image: '/src/assets/images/pizza_chicken_tikka_1794214328353.jpg',
                      hasSizes: false,
                      price: 499,
                      smallPrice: 799,
                      mediumPrice: 1199,
                      largePrice: 1699,
                      prepTime: 15,
                      ingredients: 'Fresh ingredients, special spices'
                    });
                    setShowPizzaModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Food Item</span>
                </button>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search by name, SKU, or ingredients..."
                    value={foodSearch}
                    onChange={(e) => setFoodSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl text-xs bg-stone-50 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-stone-500 whitespace-nowrap">Category:</span>
                  <select
                    value={foodCategoryFilter}
                    onChange={(e) => setFoodCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white text-stone-800"
                  >
                    <option value="All">All Categories ({pizzas.length})</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Food Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px] font-semibold">
                      <th className="py-2.5">SKU</th>
                      <th className="py-2.5">Food Item</th>
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5 text-center">Portion / Sizes</th>
                      <th className="py-2.5 text-center">Price in PKR</th>
                      <th className="py-2.5 text-center">Availability</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {pizzas
                      .filter((p) => {
                        if (foodCategoryFilter !== 'All' && p.category.toLowerCase() !== foodCategoryFilter.toLowerCase() && p.categoryId !== foodCategoryFilter) {
                          return false;
                        }
                        if (foodSearch) {
                          const q = foodSearch.toLowerCase();
                          return (
                            p.name.toLowerCase().includes(q) ||
                            p.sku.toLowerCase().includes(q) ||
                            p.description.toLowerCase().includes(q)
                          );
                        }
                        return true;
                      })
                      .map((p) => (
                        <tr key={p._id} className="hover:bg-stone-50 transition">
                          <td className="py-3 font-mono font-bold text-stone-900">{p.sku}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-10 h-10 rounded-lg object-cover bg-stone-200 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <div>
                                <p className="font-bold text-stone-900">{p.name}</p>
                                <p className="text-[11px] text-stone-500 truncate max-w-xs">{p.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 font-medium text-stone-600">
                            <span className="px-2 py-0.5 bg-stone-100 rounded text-[11px] font-semibold text-stone-800">
                              {p.category}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            {p.hasSizes !== false ? (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-semibold">
                                S / M / L Sizes
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-medium">
                                Standard Portion
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-center font-mono tabular-nums font-semibold">
                            {p.hasSizes !== false ? (
                              <div className="text-[11px] space-y-0.5">
                                <div>S: PKR {p.sizes.small.toLocaleString()}</div>
                                <div className="font-bold text-stone-900">M: PKR {p.sizes.medium.toLocaleString()}</div>
                                <div>L: PKR {p.sizes.large.toLocaleString()}</div>
                              </div>
                            ) : (
                              <span className="font-bold text-stone-900 text-sm">
                                PKR {(p.price ?? p.sizes?.medium ?? 0).toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => handleTogglePizzaAvailability(p)}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition ${
                                p.isAvailable
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {p.isAvailable ? 'In Stock' : 'Sold Out'}
                            </button>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingPizza(p);
                                  setPizzaForm({
                                    sku: p.sku,
                                    name: p.name,
                                    description: p.description,
                                    category: p.category,
                                    categoryId: p.categoryId || '',
                                    image: p.image,
                                    hasSizes: p.hasSizes !== false,
                                    price: p.price ?? p.sizes?.medium ?? 0,
                                    smallPrice: p.sizes.small,
                                    mediumPrice: p.sizes.medium,
                                    largePrice: p.sizes.large,
                                    prepTime: p.prepTimeMinutes,
                                    ingredients: (p.ingredients || []).join(', ')
                                  });
                                  setShowPizzaModal(true);
                                }}
                                className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                                title="Edit Item & Prices"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeletePizza(p._id, p.name)}
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create / Edit Food Item Modal */}
            {showPizzaModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-base font-bold text-stone-900 mb-4">
                    {editingPizza ? `Edit ${editingPizza.name} Prices & Details` : 'Add New Food Item to Catalog'}
                  </h3>

                  <form onSubmit={handleSavePizza} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">SKU *</label>
                        <input
                          type="text"
                          required
                          value={pizzaForm.sku}
                          onChange={(e) => setPizzaForm({ ...pizzaForm, sku: e.target.value })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono uppercase"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Food Item Name *</label>
                        <input
                          type="text"
                          required
                          value={pizzaForm.name}
                          onChange={(e) => setPizzaForm({ ...pizzaForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Category *</label>
                        <select
                          value={pizzaForm.category}
                          onChange={(e) => {
                            const selected = categories.find(c => c.name === e.target.value);
                            setPizzaForm({
                              ...pizzaForm,
                              category: e.target.value,
                              categoryId: selected?._id || ''
                            });
                          }}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                        >
                          {categories.map((c) => (
                            <option key={c._id} value={c.name}>
                              {c.image || ''} {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Prep Time (mins)</label>
                        <input
                          type="number"
                          min="1"
                          value={pizzaForm.prepTime}
                          onChange={(e) => setPizzaForm({ ...pizzaForm, prepTime: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Image URL or Asset Path</label>
                      <input
                        type="text"
                        placeholder="/src/assets/images/... or https://..."
                        value={pizzaForm.image}
                        onChange={(e) => setPizzaForm({ ...pizzaForm, image: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={pizzaForm.description}
                        onChange={(e) => setPizzaForm({ ...pizzaForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                      />
                    </div>

                    {/* Pricing Structure Switch */}
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">
                          Portion / Pricing Format:
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="pricingMode"
                              checked={!pizzaForm.hasSizes}
                              onChange={() => setPizzaForm({ ...pizzaForm, hasSizes: false })}
                              className="text-amber-600"
                            />
                            <span className="font-semibold text-stone-700">Single Price</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer ml-2">
                            <input
                              type="radio"
                              name="pricingMode"
                              checked={pizzaForm.hasSizes}
                              onChange={() => setPizzaForm({ ...pizzaForm, hasSizes: true })}
                              className="text-amber-600"
                            />
                            <span className="font-semibold text-stone-700">S / M / L Sizes</span>
                          </label>
                        </div>
                      </div>

                      {!pizzaForm.hasSizes ? (
                        <div>
                          <label className="block font-medium text-stone-700 mb-1">Price in Pakistani Rupees (PKR) *</label>
                          <input
                            type="number"
                            required
                            min="10"
                            value={pizzaForm.price}
                            onChange={(e) => setPizzaForm({ ...pizzaForm, price: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-sm font-bold"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block font-medium text-stone-600 mb-1">Small (PKR)</label>
                            <input
                              type="number"
                              required
                              value={pizzaForm.smallPrice}
                              onChange={(e) => setPizzaForm({ ...pizzaForm, smallPrice: Number(e.target.value) })}
                              className="w-full px-2 py-1.5 border border-stone-300 rounded font-mono"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-stone-600 mb-1">Medium (PKR)</label>
                            <input
                              type="number"
                              required
                              value={pizzaForm.mediumPrice}
                              onChange={(e) => setPizzaForm({ ...pizzaForm, mediumPrice: Number(e.target.value) })}
                              className="w-full px-2 py-1.5 border border-stone-300 rounded font-mono"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-stone-600 mb-1">Large (PKR)</label>
                            <input
                              type="number"
                              required
                              value={pizzaForm.largePrice}
                              onChange={(e) => setPizzaForm({ ...pizzaForm, largePrice: Number(e.target.value) })}
                              className="w-full px-2 py-1.5 border border-stone-300 rounded font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Ingredients (comma-separated)</label>
                      <input
                        type="text"
                        value={pizzaForm.ingredients}
                        onChange={(e) => setPizzaForm({ ...pizzaForm, ingredients: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                      <button
                        type="button"
                        onClick={() => setShowPizzaModal(false)}
                        className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold"
                      >
                        {editingPizza ? 'Update Food Item' : 'Add to Menu'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}


        {/* 4. INVENTORY & INGREDIENT RECIPES */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-base font-bold text-stone-900">Inventory & Recipe Consumption</h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Ingredients are automatically deducted from stock when kitchen staff confirms orders, and restored upon cancellation.
                  </p>
                </div>
              </div>

              {/* Inventory Stock Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px] font-semibold">
                      <th className="py-2.5">SKU</th>
                      <th className="py-2.5">Ingredient Name</th>
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5 text-center">Current Stock</th>
                      <th className="py-2.5 text-center">Min Threshold</th>
                      <th className="py-2.5 text-right">Unit Cost (PKR)</th>
                      <th className="py-2.5">Supplier</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {inventory.map((inv) => {
                      const isLow = inv.stockQuantity <= inv.minStockLevel;
                      return (
                        <tr key={inv._id} className={`hover:bg-stone-50 transition ${isLow ? 'bg-red-50/30' : ''}`}>
                          <td className="py-3 font-mono font-bold text-stone-900">{inv.sku}</td>
                          <td className="py-3">
                            <span className="font-bold text-stone-900 block">{inv.name}</span>
                            {isLow && (
                              <span className="text-[10px] text-red-700 font-semibold flex items-center gap-1 mt-0.5">
                                <AlertTriangle className="w-3 h-3" /> Low Stock Warning
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-stone-600">{inv.category}</td>
                          <td className="py-3 text-center font-mono tabular-nums font-bold">
                            <span className={isLow ? 'text-red-700' : 'text-stone-900'}>
                              {inv.stockQuantity} {inv.unit}
                            </span>
                          </td>
                          <td className="py-3 text-center font-mono tabular-nums text-stone-500">
                            {inv.minStockLevel} {inv.unit}
                          </td>
                          <td className="py-3 text-right font-mono tabular-nums font-semibold">
                            PKR {inv.purchaseCost.toLocaleString()}
                          </td>
                          <td className="py-3 text-stone-600 truncate max-w-[150px]">{inv.supplierName}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => {
                                setRestockModalItem(inv);
                                setRestockQty(10);
                                setRestockCost(inv.purchaseCost);
                              }}
                              className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold transition"
                            >
                              Restock
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inventory Audit Log Strip */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">
                Recent Inventory Transactions (Automatic Recipe Deductions & Restocks)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px] font-semibold">
                      <th className="py-2">Timestamp</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Item</th>
                      <th className="py-2 text-center">Change</th>
                      <th className="py-2 text-center">Before → After</th>
                      <th className="py-2">Reference / Reason</th>
                      <th className="py-2">Performed By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {transactions.slice(0, 15).map((tx) => (
                      <tr key={tx._id} className="hover:bg-stone-50">
                        <td className="py-2.5 font-mono text-stone-500">
                          {new Date(tx.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.type === 'ORDER_DEDUCTION'
                                ? 'bg-amber-100 text-amber-900'
                                : tx.type === 'CANCELLATION_RESTORE'
                                ? 'bg-sky-100 text-sky-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2.5 font-bold text-stone-900">{tx.itemName}</td>
                        <td className="py-2.5 text-center font-mono font-bold">
                          {tx.type === 'ORDER_DEDUCTION' ? '-' : '+'}
                          {tx.quantity} {tx.unit}
                        </td>
                        <td className="py-2.5 text-center font-mono text-stone-600">
                          {tx.previousStock} → {tx.newStock}
                        </td>
                        <td className="py-2.5 text-stone-600">
                          {tx.referenceOrderId && (
                            <span className="font-mono font-bold text-amber-700 mr-1">
                              [{tx.referenceOrderId}]
                            </span>
                          )}
                          {tx.reason}
                        </td>
                        <td className="py-2.5 text-stone-700 font-medium">{tx.performedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Restock Modal */}
            {restockModalItem && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
                <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-stone-200">
                  <h3 className="text-base font-bold text-stone-900 mb-1">
                    Restock Ingredient: {restockModalItem.name}
                  </h3>
                  <p className="text-xs text-stone-500 mb-4">
                    Current Stock: {restockModalItem.stockQuantity} {restockModalItem.unit}
                  </p>

                  <form onSubmit={handleRestockSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Quantity to Add ({restockModalItem.unit}) *
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={restockQty}
                        onChange={(e) => setRestockQty(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Purchase Cost (PKR per {restockModalItem.unit})
                      </label>
                      <input
                        type="number"
                        value={restockCost}
                        onChange={(e) => setRestockCost(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Reason / Supplier Delivery Note</label>
                      <input
                        type="text"
                        value={restockReason}
                        onChange={(e) => setRestockReason(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setRestockModalItem(null)}
                        className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold"
                      >
                        Confirm Restock
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. CUSTOMER MANAGEMENT */}
        {activeTab === 'customers' && (
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-stone-900">Registered Customers</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  View customer profiles, total orders placed, cumulative PKR spend, and account status.
                </p>
              </div>

              <input
                type="text"
                placeholder="Search customers..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px] font-semibold">
                    <th className="py-2.5">Customer Name</th>
                    <th className="py-2.5">Phone (PK)</th>
                    <th className="py-2.5">Email</th>
                    <th className="py-2.5 text-center">Orders</th>
                    <th className="py-2.5 text-right">Total Spent (PKR)</th>
                    <th className="py-2.5 text-center">Status</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {customers
                    .filter(c =>
                      c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
                      c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
                      c.phone.includes(customerSearch)
                    )
                    .map((cust) => (
                      <tr key={cust._id} className="hover:bg-stone-50">
                        <td className="py-3 font-bold text-stone-900">{cust.fullName}</td>
                        <td className="py-3 font-mono">{cust.phone}</td>
                        <td className="py-3 text-stone-600">{cust.email}</td>
                        <td className="py-3 text-center font-mono font-semibold">{cust.ordersCount || 0}</td>
                        <td className="py-3 text-right font-mono font-bold text-stone-900">
                          {(cust.totalSpent || 0).toLocaleString()}
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              cust.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {cust.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={async () => {
                              const newStatus = cust.status === 'active' ? 'inactive' : 'active';
                              const res = await api.toggleCustomerStatus(cust._id, newStatus);
                              setCustomers(prev => prev.map(c => (c._id === cust._id ? res.user : c)));
                              showToast(`Customer status updated to ${newStatus}.`);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded border border-stone-200 hover:bg-stone-100 transition"
                          >
                            {cust.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. STAFF & ROLES */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-base font-bold text-stone-900">Staff & Role-Based Permissions</h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Roles configured: Super Admin, Admin, Manager, and Order Staff.
                  </p>
                </div>

                <button
                  onClick={() => setShowStaffModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Staff Account</span>
                </button>
              </div>

              {/* Staff Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px] font-semibold">
                      <th className="py-2.5">Staff Name</th>
                      <th className="py-2.5">Email</th>
                      <th className="py-2.5">Phone</th>
                      <th className="py-2.5">Assigned Role</th>
                      <th className="py-2.5">Permissions Scope</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {staffList.map((stf) => (
                      <tr key={stf._id} className="hover:bg-stone-50">
                        <td className="py-3 font-bold text-stone-900">{stf.fullName}</td>
                        <td className="py-3 text-stone-600">{stf.email}</td>
                        <td className="py-3 font-mono">{stf.phone}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-800">
                            {stf.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 text-stone-500 text-[11px]">
                          {stf.role === 'super_admin' && 'Full Root Access: Menus, Orders, Inventory, Staff, Reports'}
                          {stf.role === 'admin' && 'Full Operations: Menus, Orders, Inventory, Reports'}
                          {stf.role === 'manager' && 'Branch Management: Orders, Recipe Inventory, Customer Support'}
                          {stf.role === 'order_staff' && 'Kitchen Terminal: Order Status Workflow & Baking'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create Staff Modal */}
            {showStaffModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
                <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-stone-200">
                  <h3 className="text-base font-bold text-stone-900 mb-4">Add Staff Member</h3>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        const res = await api.createStaff(staffForm);
                        setStaffList(prev => [...prev, res.staff]);
                        setShowStaffModal(false);
                        showToast(`Staff account created for ${res.staff.fullName}!`);
                      } catch (err: any) {
                        alert(err.message || 'Staff creation failed');
                      }
                    }}
                    className="space-y-3 text-xs"
                  >
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={staffForm.fullName}
                        onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Staff Email</label>
                      <input
                        type="email"
                        required
                        value={staffForm.email}
                        onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Phone (+92)</label>
                      <input
                        type="text"
                        required
                        value={staffForm.phone}
                        onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Assigned Role</label>
                      <select
                        value={staffForm.role}
                        onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                      >
                        <option value="order_staff">Order Staff (Kitchen / Delivery)</option>
                        <option value="manager">Branch Manager</option>
                        <option value="admin">Administrator</option>
                        <option value="super_admin">Super Administrator</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Initial Password</label>
                      <input
                        type="password"
                        required
                        placeholder="At least 6 characters"
                        value={staffForm.password}
                        onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowStaffModal(false)}
                        className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold"
                      >
                        Create Account
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. COUPONS MANAGEMENT */}
        {activeTab === 'coupons' && (
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-base font-bold text-stone-900">Promotional Discount Coupons</h2>
                <p className="text-xs text-stone-500 mt-0.5">Manage customer promo codes and minimum spend rules.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coupons.map((c) => (
                <div key={c._id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-base text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded">
                      {c.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded uppercase">
                      Active
                    </span>
                  </div>
                  <p className="font-semibold text-stone-800">
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `PKR ${c.discountValue} FLAT OFF`}
                  </p>
                  <p className="text-stone-500 mt-1">Min Order: PKR {c.minOrderAmount.toLocaleString()}</p>
                  {c.maxDiscount && <p className="text-stone-500">Max Discount: PKR {c.maxDiscount}</p>}
                  <p className="text-stone-400 mt-2 text-[10px]">Usage Count: {c.usageCount} times</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. SYSTEM & ARCHIVE BACKUP */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-stone-900">System Utilities, Export & Reset</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Production operations: download complete project ZIP archive, or restore clean Pakistani seed data.
                </p>
              </div>

              {/* Export ZIP Deliverable */}
              <div className="p-5 bg-amber-50/50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Download className="w-4 h-4 text-amber-600" />
                    <span>Download Complete Project Source Code (ZIP)</span>
                  </h4>
                  <p className="text-xs text-stone-600 mt-1">
                    Packages full Node.js, Express, React, Mongoose schemas, tests, assets, and documentation into a single deployable ZIP archive.
                  </p>
                </div>

                <a
                  href="/api/admin/system/export-zip"
                  download="pizza-house-production.zip"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap flex items-center gap-2 self-start sm:self-auto"
                >
                  <Download className="w-4 h-4" />
                  <span>Download System ZIP</span>
                </a>
              </div>

              {/* Database Reset to Seed */}
              <div className="p-5 bg-red-50/50 border border-red-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-red-900 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-red-600" />
                    <span>Reset Database to Clean Seed Data</span>
                  </h4>
                  <p className="text-xs text-red-700 mt-1">
                    Restores all initial pizzas, Pakistani customer accounts, suppliers, inventory levels, and sample orders.
                  </p>
                </div>

                <button
                  onClick={handleResetSystem}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap self-start sm:self-auto"
                >
                  Reset Database
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Confirmation Dialog */}
        {cancelModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-stone-200">
              <h3 className="text-base font-bold text-stone-900 mb-2">
                Cancel Order {cancelModalOrder.orderNumber}
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                Please record an administrative reason for cancellation. If inventory was deducted, ingredients will be automatically restored to stock.
              </p>

              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Cancellation Reason *
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg mb-4"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setCancelModalOrder(null)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleConfirmCancelOrder}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        <OrderInvoiceModal
          order={invoiceOrder}
          isOpen={!!invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      </main>
    </div>
  );
};
