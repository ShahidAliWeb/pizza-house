/**
 * MongoDB / Mongoose Database Schemas for Pizza House
 * Designed for standard MongoDB and Mongoose ODM deployment.
 */

export const MongoDBSchemas = {
  UserSchema: {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    phone: { type: String, required: true, validate: /^\+92[0-9]{10}$/ },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'manager', 'order_staff', 'customer'],
      default: 'customer',
      index: true
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    addresses: [{
      label: { type: String, enum: ['Home', 'Office', 'Other'], default: 'Home' },
      houseNumber: { type: String, required: true },
      street: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, required: true },
      deliveryInstructions: String,
      isDefault: { type: Boolean, default: false }
    }],
    timestamps: true
  },

  PizzaSchema: {
    sku: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    image: { type: String, required: true },
    sizes: {
      small: { type: Number, required: true, min: 0 },
      medium: { type: Number, required: true, min: 0 },
      large: { type: Number, required: true, min: 0 }
    },
    ingredients: [{ type: String }],
    recipes: {
      Small: { flourGrams: Number, cheeseGrams: Number, chickenGrams: Number, sauceGrams: Number, veggieGrams: Number, boxUnit: String },
      Medium: { flourGrams: Number, cheeseGrams: Number, chickenGrams: Number, sauceGrams: Number, veggieGrams: Number, boxUnit: String },
      Large: { flourGrams: Number, cheeseGrams: Number, chickenGrams: Number, sauceGrams: Number, veggieGrams: Number, boxUnit: String }
    },
    isAvailable: { type: Boolean, default: true, index: true },
    prepTimeMinutes: { type: Number, default: 20 },
    timestamps: true
  },

  OrderSchema: {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    deliveryAddress: { type: Object, required: true },
    orderNotes: String,
    items: [{
      pizzaId: String,
      sku: String,
      name: String,
      category: String,
      size: { type: String, enum: ['Small', 'Medium', 'Large'] },
      quantity: { type: Number, min: 1 },
      unitPrice: Number,
      itemTotal: Number
    }],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: String,
    grandTotal: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Cash on Delivery', 'Bank Transfer', 'Online Payment'], default: 'Cash on Delivery' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
      index: true
    },
    statusHistory: [{
      status: String,
      timestamp: Date,
      updatedBy: String,
      note: String
    }],
    cancellationReason: String,
    inventoryDeducted: { type: Boolean, default: false },
    timestamps: true
  },

  InventoryItemSchema: {
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, enum: ['Dough & Flour', 'Dairy', 'Meat', 'Produce', 'Sauce', 'Packaging'] },
    stockQuantity: { type: Number, required: true, default: 0 },
    unit: { type: String, enum: ['kg', 'grams', 'liters', 'pcs'], required: true },
    minStockLevel: { type: Number, required: true, default: 10 },
    purchaseCost: { type: Number, required: true },
    supplierId: String,
    supplierName: String,
    timestamps: true
  },

  InventoryTransactionSchema: {
    itemId: { type: String, required: true, index: true },
    itemName: String,
    type: { type: String, enum: ['RESTOCK', 'ORDER_DEDUCTION', 'CANCELLATION_RESTORE', 'MANUAL_ADJUSTMENT'] },
    quantity: Number,
    unit: String,
    previousStock: Number,
    newStock: Number,
    referenceOrderId: String,
    reason: String,
    performedBy: String,
    timestamp: { type: Date, default: Date.now }
  },

  CouponSchema: {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'] },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: Number,
    validUntil: Date,
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 }
  },

  SupplierSchema: {
    name: { type: String, required: true },
    contactPerson: String,
    phone: String,
    email: String,
    address: String,
    suppliedCategories: [String],
    isActive: { type: Boolean, default: true }
  }
};
