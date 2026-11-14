import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Pizza,
  Category,
  InventoryItem,
  InventoryTransaction,
  Supplier,
  Coupon,
  Order,
  OrderStatus,
  Role
} from './types.js';
import { seedCategories, seedFoodItems } from './seedData.js';

interface DatabaseSchema {
  users: User[];
  pizzas: Pizza[];
  categories: Category[];
  inventory: InventoryItem[];
  inventoryTransactions: InventoryTransaction[];
  suppliers: Supplier[];
  coupons: Coupon[];
  orders: Order[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'pizza_house_db.json');

// Helper to generate realistic MongoDB-like Hex ObjectId
export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const machine = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  const pid = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  const counter = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  return (timestamp + machine + pid + counter).toLowerCase();
}

// Generate human-friendly order numbers like PH-2026-1001
export function generateOrderNumber(orderCount: number): string {
  const year = new Date().getFullYear();
  const sequence = (1000 + orderCount + 1).toString();
  return `PH-${year}-${sequence}`;
}

export class PizzaHouseDatabase {
  private data: DatabaseSchema = {
    users: [],
    pizzas: [],
    categories: [],
    inventory: [],
    inventoryTransactions: [],
    suppliers: [],
    coupons: [],
    orders: []
  };

  constructor() {
    this.ensureDataDirectory();
    this.load();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  public load() {
    this.ensureDataDirectory();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        this.syncCategoriesAndFoodItems();
        return;
      } catch (err) {
        console.error('Failed to parse database file, re-initializing...', err);
      }
    }
    this.seedInitialData();
    this.save();
  }

  public syncCategoriesAndFoodItems() {
    let changed = false;
    if (!this.data.categories || this.data.categories.length < seedCategories.length) {
      const existingSlugs = new Set((this.data.categories || []).map(c => c.slug.toLowerCase()));
      for (const cat of seedCategories) {
        if (!existingSlugs.has(cat.slug.toLowerCase())) {
          this.data.categories.push({ ...cat });
          changed = true;
        }
      }
    }

    const existingPizzasMap = new Map((this.data.pizzas || []).map(p => [p.sku.toUpperCase(), p]));
    for (const item of seedFoodItems) {
      const existing = existingPizzasMap.get(item.sku.toUpperCase());
      if (!existing) {
        this.data.pizzas.push({ ...item });
        changed = true;
      } else if (existing.image.startsWith('/src/assets/images') || existing.image === item.image) {
        if (existing.image !== item.image) {
          existing.image = item.image;
          changed = true;
        }
      }
    }

    // Ensure past orders have image references
    if (this.data.orders) {
      for (const ord of this.data.orders) {
        for (const it of ord.items) {
          if (!it.image && it.sku) {
            it.image = `/uploads/products/${it.sku.toLowerCase()}.jpg`;
            changed = true;
          }
        }
      }
    }

    if (changed) {
      this.save();
    }
  }

  public save() {
    try {
      this.ensureDataDirectory();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public resetToSeed() {
    this.seedInitialData();
    this.save();
    return { success: true, message: 'Database reset to default seed data.' };
  }

  // --- SEED INITIAL DATA ---
  private seedInitialData() {
    const defaultPasswordHash = bcrypt.hashSync('Admin@123456', 10);
    const staffPasswordHash = bcrypt.hashSync('Staff@123456', 10);
    const managerPasswordHash = bcrypt.hashSync('Manager@123456', 10);
    const customerPasswordHash = bcrypt.hashSync('Customer@123', 10);

    const now = new Date().toISOString();
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Users
    const superAdmin: User = {
      _id: generateObjectId(),
      fullName: 'Super Administrator',
      email: 'admin@pizzahouse.pk',
      phone: '+923001234567',
      passwordHash: defaultPasswordHash,
      role: 'super_admin',
      status: 'active',
      addresses: [],
      createdAt: threeDaysAgo,
      updatedAt: threeDaysAgo
    };

    const manager: User = {
      _id: generateObjectId(),
      fullName: 'Tariq Mehmood (Branch Manager)',
      email: 'tariq.manager@pizzahouse.pk',
      phone: '+923219876543',
      passwordHash: managerPasswordHash,
      role: 'manager',
      status: 'active',
      addresses: [],
      createdAt: threeDaysAgo,
      updatedAt: threeDaysAgo
    };

    const kitchenStaff: User = {
      _id: generateObjectId(),
      fullName: 'Bilal Ahmed (Lead Chef)',
      email: 'bilal.kitchen@pizzahouse.pk',
      phone: '+923335551234',
      passwordHash: staffPasswordHash,
      role: 'order_staff',
      status: 'active',
      addresses: [],
      createdAt: threeDaysAgo,
      updatedAt: threeDaysAgo
    };

    const customer1: User = {
      _id: generateObjectId(),
      fullName: 'Usman Tahir',
      email: 'usman.tahir@example.pk',
      phone: '+923008889911',
      passwordHash: customerPasswordHash,
      role: 'customer',
      status: 'active',
      addresses: [
        {
          id: 'addr-1',
          label: 'Home',
          houseNumber: 'Flat 402, Al-Razi Heights',
          street: 'Block 13-D, University Road',
          area: 'Gulshan-e-Iqbal',
          city: 'Karachi',
          province: 'Sindh',
          postalCode: '75300',
          deliveryInstructions: 'Ring bell twice, 4th floor lift available',
          isDefault: true
        },
        {
          id: 'addr-2',
          label: 'Office',
          houseNumber: 'Floor 3, Executive Tower',
          street: 'Khayaban-e-Iqbal',
          area: 'Clifton Block 8',
          city: 'Karachi',
          province: 'Sindh',
          postalCode: '75600',
          deliveryInstructions: 'Hand over to reception',
          isDefault: false
        }
      ],
      createdAt: threeDaysAgo,
      updatedAt: threeDaysAgo
    };

    const customer2: User = {
      _id: generateObjectId(),
      fullName: 'Ayesha Khan',
      email: 'ayesha.khan@example.pk',
      phone: '+923224443322',
      passwordHash: customerPasswordHash,
      role: 'customer',
      status: 'active',
      addresses: [
        {
          id: 'addr-3',
          label: 'Home',
          houseNumber: 'House 142-J',
          street: 'Street 9, Sector J',
          area: 'DHA Phase 5',
          city: 'Lahore',
          province: 'Punjab',
          postalCode: '54792',
          deliveryInstructions: 'Near Jalal Sons market',
          isDefault: true
        }
      ],
      createdAt: yesterday,
      updatedAt: yesterday
    };

    this.data.users = [superAdmin, manager, kitchenStaff, customer1, customer2];

    // 2. Categories
    this.data.categories = JSON.parse(JSON.stringify(seedCategories));

    // 3. Suppliers
    const supDairy: Supplier = {
      _id: 'sup-1',
      name: 'Punjab Artisan Dairy Supplies',
      contactPerson: 'Chaudhry Rauf',
      phone: '+923015554321',
      email: 'sales@punjabdairy.com.pk',
      address: 'Dairy Complex, Multan Road, Lahore',
      suppliedCategories: ['Dairy'],
      isActive: true
    };

    const supMeat: Supplier = {
      _id: 'sup-2',
      name: 'K&N’s Commercial Poultry & Meat',
      contactPerson: 'Kamran Siddiqui',
      phone: '+923214449876',
      email: 'b2b@kandns.pk',
      address: 'Korangi Industrial Area, Karachi',
      suppliedCategories: ['Meat'],
      isActive: true
    };

    const supProduce: Supplier = {
      _id: 'sup-3',
      name: 'Al-Madina Fresh Agro Produce',
      contactPerson: 'Muhammad Aslam',
      phone: '+923332221100',
      email: 'orders@almadinafresh.pk',
      address: 'Sabzi Mandi, Super Highway, Karachi',
      suppliedCategories: ['Produce', 'Sauce'],
      isActive: true
    };

    const supPackaging: Supplier = {
      _id: 'sup-4',
      name: 'Pak Eco Packaging Solutions',
      contactPerson: 'Hassan Raza',
      phone: '+923451112233',
      email: 'info@pakecopack.com',
      address: 'Industrial Estate, Rawalpindi',
      suppliedCategories: ['Packaging'],
      isActive: true
    };

    this.data.suppliers = [supDairy, supMeat, supProduce, supPackaging];

    // 4. Inventory Items
    this.data.inventory = [
      {
        _id: 'inv-flour',
        sku: 'INV-RAW-001',
        name: 'Italian Style Fine Pizza Flour (Maida)',
        category: 'Dough & Flour',
        stockQuantity: 120, // kg
        unit: 'kg',
        minStockLevel: 25,
        purchaseCost: 180, // PKR per kg
        supplierId: 'sup-3',
        supplierName: 'Al-Madina Fresh Agro Produce',
        createdAt: threeDaysAgo,
        updatedAt: now
      },
      {
        _id: 'inv-mozzarella',
        sku: 'INV-RAW-002',
        name: 'Fresh Mozzarella & Cheddar Shreds',
        category: 'Dairy',
        stockQuantity: 45, // kg
        unit: 'kg',
        minStockLevel: 15,
        purchaseCost: 1450, // PKR per kg
        supplierId: 'sup-1',
        supplierName: 'Punjab Artisan Dairy Supplies',
        createdAt: threeDaysAgo,
        updatedAt: now
      },
      {
        _id: 'inv-chicken',
        sku: 'INV-RAW-003',
        name: 'Tikka & Fajita Marinated Boneless Chicken',
        category: 'Meat',
        stockQuantity: 38, // kg
        unit: 'kg',
        minStockLevel: 12,
        purchaseCost: 980, // PKR per kg
        supplierId: 'sup-2',
        supplierName: 'K&N’s Commercial Poultry & Meat',
        createdAt: threeDaysAgo,
        updatedAt: now
      },
      {
        _id: 'inv-sauce',
        sku: 'INV-RAW-004',
        name: 'San Marzano Herb Pizza Sauce',
        category: 'Sauce',
        stockQuantity: 30, // liters
        unit: 'liters',
        minStockLevel: 10,
        purchaseCost: 650, // PKR per liter
        supplierId: 'sup-3',
        supplierName: 'Al-Madina Fresh Agro Produce',
        createdAt: threeDaysAgo,
        updatedAt: now
      },
      {
        _id: 'inv-veggies',
        sku: 'INV-RAW-005',
        name: 'Fresh Bell Peppers, Onions & Mushrooms',
        category: 'Produce',
        stockQuantity: 28, // kg
        unit: 'kg',
        minStockLevel: 8,
        purchaseCost: 320, // PKR per kg
        supplierId: 'sup-3',
        supplierName: 'Al-Madina Fresh Agro Produce',
        createdAt: threeDaysAgo,
        updatedAt: now
      },
      {
        _id: 'inv-box-small',
        sku: 'INV-PKG-001',
        name: 'Small Pizza Corrugated Box (8-inch)',
        category: 'Packaging',
        stockQuantity: 350,
        unit: 'pcs',
        minStockLevel: 50,
        purchaseCost: 28, // PKR per pc
        supplierId: 'sup-4',
        supplierName: 'Pak Eco Packaging Solutions',
        createdAt: threeDaysAgo,
        updatedAt: now
      },
      {
        _id: 'inv-box-med',
        sku: 'INV-PKG-002',
        name: 'Medium Pizza Corrugated Box (11-inch)',
        category: 'Packaging',
        stockQuantity: 420,
        unit: 'pcs',
        minStockLevel: 50,
        purchaseCost: 38,
        supplierId: 'sup-4',
        supplierName: 'Pak Eco Packaging Solutions',
        createdAt: threeDaysAgo,
        updatedAt: now
      },
      {
        _id: 'inv-box-large',
        sku: 'INV-PKG-003',
        name: 'Large Pizza Corrugated Box (14-inch)',
        category: 'Packaging',
        stockQuantity: 280,
        unit: 'pcs',
        minStockLevel: 50,
        purchaseCost: 48,
        supplierId: 'sup-4',
        supplierName: 'Pak Eco Packaging Solutions',
        createdAt: threeDaysAgo,
        updatedAt: now
      }
    ];

    // 5. Initial Inventory Transactions
    this.data.inventoryTransactions = [
      {
        _id: 'tx-1',
        itemId: 'inv-mozzarella',
        itemName: 'Fresh Mozzarella & Cheddar Shreds',
        type: 'RESTOCK',
        quantity: 50,
        unit: 'kg',
        previousStock: 0,
        newStock: 50,
        reason: 'Monthly bulk dairy intake from Punjab Dairy',
        performedBy: 'Tariq Mehmood',
        timestamp: threeDaysAgo
      },
      {
        _id: 'tx-2',
        itemId: 'inv-chicken',
        itemName: 'Tikka & Fajita Marinated Boneless Chicken',
        type: 'RESTOCK',
        quantity: 45,
        unit: 'kg',
        previousStock: 0,
        newStock: 45,
        reason: 'Fresh batch of boneless chicken delivery',
        performedBy: 'Tariq Mehmood',
        timestamp: threeDaysAgo
      }
    ];

    // 6. Pizzas & Fast Food Items
    this.data.pizzas = JSON.parse(JSON.stringify(seedFoodItems));


    // 7. Coupons
    this.data.coupons = [
      {
        _id: 'coup-1',
        code: 'WELCOME10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 1500,
        maxDiscount: 400,
        validUntil: '2027-12-31',
        isActive: true,
        usageCount: 14
      },
      {
        _id: 'coup-2',
        code: 'PIZZAFEST',
        discountType: 'FIXED',
        discountValue: 300,
        minOrderAmount: 2000,
        validUntil: '2027-12-31',
        isActive: true,
        usageCount: 22
      },
      {
        _id: 'coup-3',
        code: 'SUPERDEAL',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minOrderAmount: 2500,
        maxDiscount: 600,
        validUntil: '2027-12-31',
        isActive: true,
        usageCount: 8
      }
    ];

    // 8. Sample Past & Active Orders
    const order1: Order = {
      _id: generateObjectId(),
      orderNumber: 'PH-2026-1001',
      customerId: customer1._id,
      customerName: customer1.fullName,
      customerEmail: customer1.email,
      customerPhone: customer1.phone,
      deliveryAddress: customer1.addresses[0],
      orderNotes: 'Please ensure extra napkins and hot sauce sachets.',
      items: [
        {
          pizzaId: 'piz-1',
          sku: 'PH-PIZ-01',
          name: 'Chicken Tikka',
          category: 'Chicken Specials',
          size: 'Large',
          quantity: 1,
          unitPrice: 1699,
          itemTotal: 1699
        },
        {
          pizzaId: 'piz-3',
          sku: 'PH-PIZ-03',
          name: 'Malai Boti',
          category: 'Chicken Specials',
          size: 'Medium',
          quantity: 1,
          unitPrice: 1299,
          itemTotal: 1299
        }
      ],
      subtotal: 2998,
      deliveryFee: 0, // Free above 2500
      taxAmount: 150, // 5% provincial sales tax
      discountAmount: 300,
      couponCode: 'PIZZAFEST',
      grandTotal: 2848,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      statusHistory: [
        { status: 'Pending', timestamp: yesterday, updatedBy: 'System (Online Checkout)' },
        { status: 'Confirmed', timestamp: yesterday, updatedBy: 'Tariq Mehmood' },
        { status: 'Preparing', timestamp: yesterday, updatedBy: 'Bilal Ahmed' },
        { status: 'Ready for Pickup', timestamp: yesterday, updatedBy: 'Bilal Ahmed' },
        { status: 'Out for Delivery', timestamp: yesterday, updatedBy: 'Rider Farhan' },
        { status: 'Delivered', timestamp: yesterday, updatedBy: 'Rider Farhan' }
      ],
      inventoryDeducted: true,
      createdAt: yesterday,
      updatedAt: yesterday
    };

    const order2: Order = {
      _id: generateObjectId(),
      orderNumber: 'PH-2026-1002',
      customerId: customer2._id,
      customerName: customer2.fullName,
      customerEmail: customer2.email,
      customerPhone: customer2.phone,
      deliveryAddress: customer2.addresses[0],
      orderNotes: 'Please call before arriving.',
      items: [
        {
          pizzaId: 'piz-6',
          sku: 'PH-PIZ-06',
          name: 'Cheese Lover',
          category: 'Specialty & Gourmet',
          size: 'Medium',
          quantity: 1,
          unitPrice: 1399,
          itemTotal: 1399
        }
      ],
      subtotal: 1399,
      deliveryFee: 150,
      taxAmount: 70,
      discountAmount: 0,
      grandTotal: 1619,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      orderStatus: 'Preparing',
      statusHistory: [
        { status: 'Pending', timestamp: twoHoursAgo, updatedBy: 'System (Online Checkout)' },
        { status: 'Confirmed', timestamp: twoHoursAgo, updatedBy: 'Tariq Mehmood' },
        { status: 'Preparing', timestamp: now, updatedBy: 'Bilal Ahmed' }
      ],
      inventoryDeducted: true,
      createdAt: twoHoursAgo,
      updatedAt: now
    };

    this.data.orders = [order1, order2];
  }

  // --- QUERY & MUTATION METHODS ---

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u._id === id);
  }

  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): User {
    const now = new Date().toISOString();
    const newUser: User = {
      ...user,
      _id: generateObjectId(),
      createdAt: now,
      updatedAt: now
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const user = this.findUserById(id);
    if (!user) return null;
    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return user;
  }

  // Pizzas
  public getPizzas(): Pizza[] {
    return this.data.pizzas;
  }

  public findPizzaById(id: string): Pizza | undefined {
    return this.data.pizzas.find(p => p._id === id);
  }

  public createPizza(pizza: Omit<Pizza, '_id' | 'createdAt' | 'updatedAt'>): Pizza {
    const now = new Date().toISOString();
    const newPizza: Pizza = {
      ...pizza,
      _id: generateObjectId(),
      createdAt: now,
      updatedAt: now
    };
    this.data.pizzas.push(newPizza);
    this.save();
    return newPizza;
  }

  public updatePizza(id: string, updates: Partial<Pizza>): Pizza | null {
    const pizza = this.findPizzaById(id);
    if (!pizza) return null;
    Object.assign(pizza, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return pizza;
  }

  public deletePizza(id: string): boolean {
    const idx = this.data.pizzas.findIndex(p => p._id === id);
    if (idx === -1) return false;
    this.data.pizzas.splice(idx, 1);
    this.save();
    return true;
  }

  // Categories
  public getCategories(): Category[] {
    return this.data.categories;
  }

  public findCategoryById(id: string): Category | undefined {
    return this.data.categories.find(c => c._id === id || c.slug === id);
  }

  public createCategory(cat: Omit<Category, '_id'>): Category {
    const newCat: Category = {
      ...cat,
      _id: generateObjectId()
    };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const cat = this.findCategoryById(id);
    if (!cat) return null;
    Object.assign(cat, updates);
    this.save();
    return cat;
  }

  public deleteCategory(id: string): boolean {
    const idx = this.data.categories.findIndex(c => c._id === id || c.slug === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.save();
    return true;
  }

  public toggleCategory(id: string): Category | null {
    const cat = this.findCategoryById(id);
    if (!cat) return null;
    cat.isActive = cat.isActive !== false ? false : true;
    this.save();
    return cat;
  }

  // Inventory
  public getInventory(): InventoryItem[] {
    return this.data.inventory;
  }

  public findInventoryItemById(id: string): InventoryItem | undefined {
    return this.data.inventory.find(i => i._id === id);
  }

  public restockInventory(
    itemId: string,
    quantityToAdd: number,
    costPerUnit: number,
    performedBy: string,
    reason: string
  ): { item: InventoryItem; transaction: InventoryTransaction } | null {
    const item = this.findInventoryItemById(itemId);
    if (!item) return null;

    const previousStock = item.stockQuantity;
    const newStock = Math.round((previousStock + quantityToAdd) * 100) / 100;
    item.stockQuantity = newStock;
    if (costPerUnit > 0) item.purchaseCost = costPerUnit;
    item.updatedAt = new Date().toISOString();

    const transaction: InventoryTransaction = {
      _id: generateObjectId(),
      itemId: item._id,
      itemName: item.name,
      type: 'RESTOCK',
      quantity: quantityToAdd,
      unit: item.unit,
      previousStock,
      newStock,
      reason,
      performedBy,
      timestamp: new Date().toISOString()
    };

    this.data.inventoryTransactions.unshift(transaction);
    this.save();
    return { item, transaction };
  }

  public getInventoryTransactions(): InventoryTransaction[] {
    return this.data.inventoryTransactions;
  }

  // Suppliers
  public getSuppliers(): Supplier[] {
    return this.data.suppliers;
  }

  public createSupplier(supplier: Omit<Supplier, '_id'>): Supplier {
    const newSup: Supplier = {
      ...supplier,
      _id: generateObjectId()
    };
    this.data.suppliers.push(newSup);
    this.save();
    return newSup;
  }

  // Coupons
  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public findCouponByCode(code: string): Coupon | undefined {
    return this.data.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
  }

  public createCoupon(coupon: Omit<Coupon, '_id' | 'usageCount'>): Coupon {
    const newCoupon: Coupon = {
      ...coupon,
      _id: generateObjectId(),
      code: coupon.code.toUpperCase(),
      usageCount: 0
    };
    this.data.coupons.push(newCoupon);
    this.save();
    return newCoupon;
  }

  // Orders
  public getOrders(): Order[] {
    return this.data.orders;
  }

  public findOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o._id === id || o.orderNumber === id);
  }

  public createOrder(orderData: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: any;
    orderNotes?: string;
    items: any[];
    couponCode?: string;
    paymentMethod: 'Cash on Delivery' | 'Bank Transfer' | 'Online Payment';
  }): Order {
    const now = new Date().toISOString();
    const orderCount = this.data.orders.length;
    const orderNumber = generateOrderNumber(orderCount);

    // Calculate subtotal from authoritative pizza prices
    let calculatedSubtotal = 0;
    const verifiedItems = orderData.items.map(item => {
      const pizza = this.findPizzaById(item.pizzaId);
      if (!pizza) {
        throw new Error(`Pizza with ID ${item.pizzaId} not found`);
      }
      const sizeKey = (item.size ? item.size.toLowerCase() : '') as 'small' | 'medium' | 'large';
      const unitPrice = pizza.sizes?.[sizeKey] ?? pizza.price ?? pizza.sizes?.medium ?? pizza.sizes?.small ?? 0;
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      const itemTotal = unitPrice * quantity;
      calculatedSubtotal += itemTotal;

      return {
        pizzaId: pizza._id,
        sku: pizza.sku,
        name: pizza.name,
        category: pizza.category,
        image: pizza.image,
        size: item.size,
        quantity,
        unitPrice,
        itemTotal
      };
    });

    // Delivery fee rule: Free delivery over PKR 2500, otherwise PKR 150
    const deliveryFee = calculatedSubtotal >= 2500 ? 0 : 150;

    // Provincial Sales Tax (PRA / SRB approx 5%)
    const taxAmount = Math.round(calculatedSubtotal * 0.05);

    // Discount coupon validation
    let discountAmount = 0;
    let appliedCoupon: Coupon | undefined;
    if (orderData.couponCode) {
      appliedCoupon = this.findCouponByCode(orderData.couponCode);
      if (appliedCoupon && appliedCoupon.isActive) {
        const isValidDate = new Date(appliedCoupon.validUntil) >= new Date();
        const meetsMin = calculatedSubtotal >= appliedCoupon.minOrderAmount;
        if (isValidDate && meetsMin) {
          if (appliedCoupon.discountType === 'PERCENTAGE') {
            discountAmount = Math.round((calculatedSubtotal * appliedCoupon.discountValue) / 100);
            if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
              discountAmount = appliedCoupon.maxDiscount;
            }
          } else {
            discountAmount = appliedCoupon.discountValue;
          }
          appliedCoupon.usageCount += 1;
        }
      }
    }

    const grandTotal = Math.max(0, calculatedSubtotal + deliveryFee + taxAmount - discountAmount);

    const newOrder: Order = {
      _id: generateObjectId(),
      orderNumber,
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      deliveryAddress: orderData.deliveryAddress,
      orderNotes: orderData.orderNotes,
      items: verifiedItems,
      subtotal: calculatedSubtotal,
      deliveryFee,
      taxAmount,
      discountAmount,
      couponCode: appliedCoupon?.code,
      grandTotal,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      statusHistory: [
        {
          status: 'Pending',
          timestamp: now,
          updatedBy: 'System (Online Checkout)',
          note: 'Order successfully placed by customer.'
        }
      ],
      inventoryDeducted: false,
      createdAt: now,
      updatedAt: now
    };

    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  // Workflow transition with automatic recipe ingredient deduction and prevention of duplicate deductions
  public updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    updatedBy: string,
    note?: string,
    cancellationReason?: string
  ): { order: Order; deductionSummary?: string[] } {
    const order = this.findOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      Pending: ['Confirmed', 'Cancelled'],
      Confirmed: ['Preparing', 'Cancelled'],
      Preparing: ['Ready for Pickup'],
      'Ready for Pickup': ['Out for Delivery'],
      'Out for Delivery': ['Delivered'],
      Delivered: [],
      Cancelled: []
    };

    // Check transition validity
    if (!allowedTransitions[order.orderStatus].includes(newStatus)) {
      throw new Error(`Cannot transition order from "${order.orderStatus}" to "${newStatus}". Valid transitions: ${allowedTransitions[order.orderStatus].join(', ') || 'None'}`);
    }

    const now = new Date().toISOString();
    let deductionSummary: string[] = [];

    // Trigger ingredient deduction when order becomes Confirmed or Preparing
    if ((newStatus === 'Confirmed' || newStatus === 'Preparing') && !order.inventoryDeducted) {
      deductionSummary = this.deductRecipeIngredientsForOrder(order, updatedBy);
      order.inventoryDeducted = true;
    }

    // If order was cancelled and inventory was already deducted, restore ingredients back!
    if (newStatus === 'Cancelled' && order.inventoryDeducted) {
      this.restoreRecipeIngredientsForOrder(order, updatedBy, cancellationReason || 'Order Cancelled');
      order.inventoryDeducted = false;
    }

    order.orderStatus = newStatus;
    if (cancellationReason) {
      order.cancellationReason = cancellationReason;
    }
    if (newStatus === 'Delivered' && order.paymentMethod === 'Cash on Delivery') {
      order.paymentStatus = 'Paid';
    }

    order.statusHistory.push({
      status: newStatus,
      timestamp: now,
      updatedBy,
      note: note || (cancellationReason ? `Cancelled: ${cancellationReason}` : undefined)
    });
    order.updatedAt = now;

    this.save();
    return { order, deductionSummary };
  }

  // Deduct inventory items based on recipe requirements
  private deductRecipeIngredientsForOrder(order: Order, performedBy: string): string[] {
    const summary: string[] = [];

    for (const item of order.items) {
      const pizza = this.findPizzaById(item.pizzaId);
      if (!pizza || !pizza.recipes) continue;
      const sizeRecipe = pizza.recipes[item.size as 'Small' | 'Medium' | 'Large'];
      if (!sizeRecipe) continue;

      const totalQty = item.quantity;
      // Convert recipe quantities to kg / units
      const flourKg = (sizeRecipe.flourGrams * totalQty) / 1000;
      const cheeseKg = (sizeRecipe.cheeseGrams * totalQty) / 1000;
      const chickenKg = (sizeRecipe.chickenGrams * totalQty) / 1000;
      const sauceLiters = (sizeRecipe.sauceGrams * totalQty) / 1000;
      const veggiesKg = (sizeRecipe.veggieGrams * totalQty) / 1000;
      const boxItem = this.findInventoryItemById(sizeRecipe.boxUnit);

      this.deductItemStock('inv-flour', flourKg, order.orderNumber, performedBy, `Recipe for ${totalQty}x ${item.name} (${item.size})`);
      this.deductItemStock('inv-mozzarella', cheeseKg, order.orderNumber, performedBy, `Recipe for ${totalQty}x ${item.name} (${item.size})`);
      if (chickenKg > 0) {
        this.deductItemStock('inv-chicken', chickenKg, order.orderNumber, performedBy, `Recipe for ${totalQty}x ${item.name} (${item.size})`);
      }
      this.deductItemStock('inv-sauce', sauceLiters, order.orderNumber, performedBy, `Recipe for ${totalQty}x ${item.name} (${item.size})`);
      if (veggiesKg > 0) {
        this.deductItemStock('inv-veggies', veggiesKg, order.orderNumber, performedBy, `Recipe for ${totalQty}x ${item.name} (${item.size})`);
      }
      if (boxItem) {
        this.deductItemStock(boxItem._id, totalQty, order.orderNumber, performedBy, `Box packaging for ${totalQty}x ${item.name} (${item.size})`);
      }

      summary.push(`${item.name} (${item.size} x${totalQty}) ingredients deducted.`);
    }

    return summary;
  }

  private deductItemStock(itemId: string, qty: number, orderNumber: string, performedBy: string, reason: string) {
    const item = this.findInventoryItemById(itemId);
    if (!item) return;
    const previousStock = item.stockQuantity;
    const newStock = Math.max(0, Math.round((previousStock - qty) * 1000) / 1000);
    item.stockQuantity = newStock;
    item.updatedAt = new Date().toISOString();

    this.data.inventoryTransactions.unshift({
      _id: generateObjectId(),
      itemId: item._id,
      itemName: item.name,
      type: 'ORDER_DEDUCTION',
      quantity: Math.round(qty * 1000) / 1000,
      unit: item.unit,
      previousStock,
      newStock,
      referenceOrderId: orderNumber,
      reason,
      performedBy,
      timestamp: new Date().toISOString()
    });
  }

  private restoreRecipeIngredientsForOrder(order: Order, performedBy: string, reason: string) {
    for (const item of order.items) {
      const pizza = this.findPizzaById(item.pizzaId);
      if (!pizza || !pizza.recipes) continue;
      const sizeRecipe = pizza.recipes[item.size as 'Small' | 'Medium' | 'Large'];
      if (!sizeRecipe) continue;

      const totalQty = item.quantity;
      const flourKg = (sizeRecipe.flourGrams * totalQty) / 1000;
      const cheeseKg = (sizeRecipe.cheeseGrams * totalQty) / 1000;
      const chickenKg = (sizeRecipe.chickenGrams * totalQty) / 1000;
      const sauceLiters = (sizeRecipe.sauceGrams * totalQty) / 1000;
      const veggiesKg = (sizeRecipe.veggieGrams * totalQty) / 1000;
      const boxItem = this.findInventoryItemById(sizeRecipe.boxUnit);

      this.restoreItemStock('inv-flour', flourKg, order.orderNumber, performedBy, reason);
      this.restoreItemStock('inv-mozzarella', cheeseKg, order.orderNumber, performedBy, reason);
      if (chickenKg > 0) {
        this.restoreItemStock('inv-chicken', chickenKg, order.orderNumber, performedBy, reason);
      }
      this.restoreItemStock('inv-sauce', sauceLiters, order.orderNumber, performedBy, reason);
      if (veggiesKg > 0) {
        this.restoreItemStock('inv-veggies', veggiesKg, order.orderNumber, performedBy, reason);
      }
      if (boxItem) {
        this.restoreItemStock(boxItem._id, totalQty, order.orderNumber, performedBy, reason);
      }
    }
  }

  private restoreItemStock(itemId: string, qty: number, orderNumber: string, performedBy: string, reason: string) {
    const item = this.findInventoryItemById(itemId);
    if (!item) return;
    const previousStock = item.stockQuantity;
    const newStock = Math.round((previousStock + qty) * 1000) / 1000;
    item.stockQuantity = newStock;
    item.updatedAt = new Date().toISOString();

    this.data.inventoryTransactions.unshift({
      _id: generateObjectId(),
      itemId: item._id,
      itemName: item.name,
      type: 'CANCELLATION_RESTORE',
      quantity: Math.round(qty * 1000) / 1000,
      unit: item.unit,
      previousStock,
      newStock,
      referenceOrderId: orderNumber,
      reason: `Restored on cancellation: ${reason}`,
      performedBy,
      timestamp: new Date().toISOString()
    });
  }

  // Dashboard & Statistics
  public getDashboardStats() {
    const orders = this.data.orders;
    const users = this.data.users;
    const pizzas = this.data.pizzas;
    const inventory = this.data.inventory;

    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrdersList = orders.filter(o => o.createdAt.startsWith(todayStr));
    const todayOrders = todayOrdersList.length;
    const todayRevenue = todayOrdersList
      .filter(o => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;
    const preparingOrders = orders.filter(o => o.orderStatus === 'Preparing').length;
    const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered').length;
    const cancelledOrders = orders.filter(o => o.orderStatus === 'Cancelled').length;

    const totalCustomers = users.filter(u => u.role === 'customer').length;
    const totalPizzas = pizzas.length;

    const lowStockItems = inventory.filter(i => i.stockQuantity <= i.minStockLevel);

    // Pizza popularity
    const pizzaCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const order of orders) {
      if (order.orderStatus === 'Cancelled') continue;
      for (const item of order.items) {
        if (!pizzaCounts[item.name]) {
          pizzaCounts[item.name] = { name: item.name, count: 0, revenue: 0 };
        }
        pizzaCounts[item.name].count += item.quantity;
        pizzaCounts[item.name].revenue += item.itemTotal;
      }
    }

    const popularPizzas = Object.values(pizzaCounts).sort((a, b) => b.count - a.count);

    return {
      totalRevenue,
      todayRevenue,
      totalOrders,
      todayOrders,
      pendingOrders,
      preparingOrders,
      deliveredOrders,
      cancelledOrders,
      totalCustomers,
      totalPizzas,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      popularPizzas
    };
  }
}

export const db = new PizzaHouseDatabase();
