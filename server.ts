import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import JSZip from 'jszip';
import fs from 'fs';
import { db } from './server/db.js';
import { OrderStatus, Role } from './server/types.js';

import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Permanent Local Image Storage Directory
const UPLOADS_DIR = path.resolve(process.cwd(), 'public/uploads/products');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded product images statically
app.use('/uploads', express.static(path.resolve(process.cwd(), 'public/uploads')));

// Configure Multer for permanent local product image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const cleanExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif'].includes(ext) ? ext : '.jpg';
    const uniqueName = `prod-${Date.now()}-${Math.round(Math.random() * 1e6)}${cleanExt}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max file size
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, GIF, SVG, and AVIF image files are allowed.'));
    }
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Image Upload API ---
app.post('/api/upload', (req: Request, res: Response) => {
  upload.single('image')(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image file size exceeds the 5MB limit. Please upload a smaller image.' });
      }
      return res.status(400).json({ error: err.message || 'Image upload failed' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file was provided in the upload request' });
    }

    const relativeUrl = `/uploads/products/${req.file.filename}`;
    return res.status(201).json({
      success: true,
      imageUrl: relativeUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      message: 'Product image uploaded and stored permanently'
    });
  });
});

app.delete('/api/upload/:filename', (req: Request, res: Response) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ success: true, message: 'Image deleted from storage' });
    }
    return res.status(404).json({ error: 'Image file not found' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete image' });
  }
});

// --- RESTful API ROUTES ---

// 1. Authentication & Customer Management
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Validate Pakistani Phone format (+92 followed by 10 digits)
    const phoneRegex = /^\+92[0-9]{10}$/;
    const normalizedPhone = phone.trim();
    if (!phoneRegex.test(normalizedPhone)) {
      return res.status(400).json({ error: 'Invalid phone format. Please use Pakistani format: +923XXXXXXXXX' });
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = db.createUser({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: normalizedPhone,
      passwordHash,
      role: 'customer',
      status: 'active',
      addresses: []
    });

    const { passwordHash: _, ...userSafe } = newUser;
    return res.status(201).json({ success: true, user: userSafe });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
    }

    const passwordMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { passwordHash: _, ...userSafe } = user;
    return res.json({ success: true, user: userSafe });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.get('/api/auth/user/:id', (req: Request, res: Response) => {
  const user = db.findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { passwordHash: _, ...userSafe } = user;
  return res.json({ success: true, user: userSafe });
});

app.put('/api/auth/profile/:id', (req: Request, res: Response) => {
  try {
    const { fullName, phone } = req.body;
    const phoneRegex = /^\+92[0-9]{10}$/;
    if (phone && !phoneRegex.test(phone.trim())) {
      return res.status(400).json({ error: 'Invalid phone format. Please use +923XXXXXXXXX' });
    }

    const updated = db.updateUser(req.params.id, {
      ...(fullName ? { fullName: fullName.trim() } : {}),
      ...(phone ? { phone: phone.trim() } : {})
    });

    if (!updated) return res.status(404).json({ error: 'User not found' });
    const { passwordHash: _, ...userSafe } = updated;
    return res.json({ success: true, user: userSafe });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/change-password/:id', (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = db.findUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    user.passwordHash = bcrypt.hashSync(newPassword, 10);
    db.updateUser(user._id, { passwordHash: user.passwordHash });
    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Addresses
app.post('/api/auth/addresses/:userId', (req: Request, res: Response) => {
  const user = db.findUserById(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { label, houseNumber, street, area, city, province, postalCode, deliveryInstructions, isDefault } = req.body;
  if (!houseNumber || !street || !area || !city) {
    return res.status(400).json({ error: 'House/flat number, street, area, and city are required' });
  }

  const newAddress = {
    id: 'addr-' + Date.now(),
    label: label || 'Home',
    houseNumber,
    street,
    area,
    city,
    province: province || 'Sindh',
    postalCode: postalCode || '75000',
    deliveryInstructions,
    isDefault: !!isDefault
  };

  if (newAddress.isDefault) {
    user.addresses.forEach(a => (a.isDefault = false));
  }

  user.addresses.push(newAddress);
  db.updateUser(user._id, { addresses: user.addresses });
  return res.json({ success: true, addresses: user.addresses });
});

app.delete('/api/auth/addresses/:userId/:addressId', (req: Request, res: Response) => {
  const user = db.findUserById(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.addresses = user.addresses.filter(a => a.id !== req.params.addressId);
  db.updateUser(user._id, { addresses: user.addresses });
  return res.json({ success: true, addresses: user.addresses });
});

// 2. Pizzas & Menu Management
app.get('/api/pizzas', (req: Request, res: Response) => {
  const { category, search } = req.query;
  let list = db.getPizzas();

  if (category && typeof category === 'string' && category !== 'All') {
    list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  return res.json({ success: true, pizzas: list });
});

app.get('/api/pizzas/:id', (req: Request, res: Response) => {
  const pizza = db.findPizzaById(req.params.id);
  if (!pizza) return res.status(404).json({ error: 'Pizza not found' });
  return res.json({ success: true, pizza });
});

app.post('/api/pizzas', (req: Request, res: Response) => {
  try {
    const { name, sku, description, category, categoryId, image, sizes, price, hasSizes, ingredients, recipes, prepTimeMinutes } = req.body;

    const singlePrice = Number(price) || Number(sizes?.medium) || Number(sizes?.small) || 0;
    const hasSizesBool = hasSizes !== false && ((sizes?.small && sizes?.medium && sizes?.large) || !singlePrice);

    if (!name || !sku || (!singlePrice && (!sizes?.small || !sizes?.medium || !sizes?.large))) {
      return res.status(400).json({ error: 'Name, SKU, and price (or Small, Medium, Large sizes) are required' });
    }

    const created = db.createPizza({
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      description: description || '',
      category: category || 'Fast Food',
      categoryId: categoryId || undefined,
      image: image || '/src/assets/images/pizza_chicken_tikka_1794214328353.jpg',
      price: singlePrice,
      hasSizes: hasSizesBool,
      sizes: hasSizesBool ? {
        small: Number(sizes?.small || singlePrice),
        medium: Number(sizes?.medium || singlePrice),
        large: Number(sizes?.large || singlePrice)
      } : {
        small: singlePrice,
        medium: singlePrice,
        large: singlePrice
      },
      ingredients: Array.isArray(ingredients) ? ingredients : (ingredients || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      recipes: recipes || (hasSizesBool ? {
        Small: { flourGrams: 160, cheeseGrams: 100, chickenGrams: 80, sauceGrams: 50, veggieGrams: 30, boxUnit: 'inv-box-small' },
        Medium: { flourGrams: 260, cheeseGrams: 180, chickenGrams: 140, sauceGrams: 80, veggieGrams: 50, boxUnit: 'inv-box-med' },
        Large: { flourGrams: 380, cheeseGrams: 260, chickenGrams: 200, sauceGrams: 120, veggieGrams: 80, boxUnit: 'inv-box-large' }
      } : undefined),
      isAvailable: true,
      prepTimeMinutes: Number(prepTimeMinutes) || 15
    });

    return res.status(201).json({ success: true, pizza: created });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/pizzas/:id', (req: Request, res: Response) => {
  try {
    const body = { ...req.body };
    if (body.price && (!body.sizes || body.hasSizes === false)) {
      const p = Number(body.price);
      body.sizes = { small: p, medium: p, large: p };
    }
    const updated = db.updatePizza(req.params.id, body);
    if (!updated) return res.status(404).json({ error: 'Food item not found' });
    return res.json({ success: true, pizza: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pizzas/:id', (req: Request, res: Response) => {
  const deleted = db.deletePizza(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Food item not found' });
  return res.json({ success: true, message: 'Food item deleted successfully' });
});

// Categories Management
app.get('/api/categories', (_req: Request, res: Response) => {
  return res.json({ success: true, categories: db.getCategories() });
});

app.post('/api/categories', (req: Request, res: Response) => {
  try {
    const { name, slug, description, image, displayOrder, isActive } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const finalSlug = (slug || name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const created = db.createCategory({
      name: name.trim(),
      slug: finalSlug,
      description: description ? description.trim() : '',
      image: image ? image.trim() : '🍔',
      displayOrder: Number(displayOrder) || (db.getCategories().length + 1),
      isActive: isActive !== false
    });
    return res.status(201).json({ success: true, category: created });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/categories/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    return res.json({ success: true, category: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', (req: Request, res: Response) => {
  const deleted = db.deleteCategory(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Category not found' });
  return res.json({ success: true, message: 'Category deleted successfully' });
});

app.patch('/api/categories/:id/toggle', (req: Request, res: Response) => {
  const updated = db.toggleCategory(req.params.id);
  if (!updated) return res.status(404).json({ error: 'Category not found' });
  return res.json({ success: true, category: updated });
});

// 3. Coupons
app.get('/api/coupons', (_req: Request, res: Response) => {
  return res.json({ success: true, coupons: db.getCoupons() });
});

app.get('/api/coupons/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.query;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Coupon code is required' });
  }

  const coupon = db.findCouponByCode(code);
  if (!coupon || !coupon.isActive) {
    return res.status(404).json({ error: 'Invalid or expired coupon code' });
  }

  const sub = Number(subtotal) || 0;
  if (sub < coupon.minOrderAmount) {
    return res.status(400).json({
      error: `This coupon requires a minimum order of PKR ${coupon.minOrderAmount.toLocaleString()}`
    });
  }

  let discount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discount = Math.round((sub * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  return res.json({
    success: true,
    code: coupon.code,
    discountAmount: discount,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue
  });
});

app.post('/api/coupons', (req: Request, res: Response) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxDiscount, validUntil } = req.body;
    if (!code || !discountValue) {
      return res.status(400).json({ error: 'Code and discount value are required' });
    }

    const created = db.createCoupon({
      code: code.trim().toUpperCase(),
      discountType: discountType || 'PERCENTAGE',
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      validUntil: validUntil || '2027-12-31',
      isActive: true
    });

    return res.status(201).json({ success: true, coupon: created });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Orders
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const { customerId, customerName, customerEmail, customerPhone, deliveryAddress, orderNotes, items, couponCode, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one pizza' });
    }

    if (!customerName || !customerPhone || !deliveryAddress) {
      return res.status(400).json({ error: 'Customer name, phone, and complete delivery address are required' });
    }

    // Phone validation
    const phoneRegex = /^\+92[0-9]{10}$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      return res.status(400).json({ error: 'Invalid phone number format. Must be +923XXXXXXXXX' });
    }

    const newOrder = db.createOrder({
      customerId: customerId || 'guest-' + Date.now(),
      customerName: customerName.trim(),
      customerEmail: customerEmail?.trim() || 'customer@pizzahouse.pk',
      customerPhone: customerPhone.trim(),
      deliveryAddress,
      orderNotes,
      items,
      couponCode,
      paymentMethod: paymentMethod || 'Cash on Delivery'
    });

    return res.status(201).json({ success: true, order: newOrder });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.get('/api/orders/my-orders', (req: Request, res: Response) => {
  const { customerId } = req.query;
  if (!customerId || typeof customerId !== 'string') {
    return res.status(400).json({ error: 'Customer ID is required' });
  }

  const userOrders = db.getOrders().filter(o => o.customerId === customerId);
  return res.json({ success: true, orders: userOrders });
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = db.findOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  return res.json({ success: true, order });
});

app.post('/api/orders/:id/cancel', (req: Request, res: Response) => {
  try {
    const { reason, performedBy } = req.body;
    const order = db.findOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.orderStatus !== 'Pending' && order.orderStatus !== 'Confirmed') {
      return res.status(400).json({
        error: `Order cannot be cancelled in "${order.orderStatus}" state. Orders can only be cancelled while Pending or Confirmed.`
      });
    }

    const result = db.updateOrderStatus(
      order._id,
      'Cancelled',
      performedBy || 'Customer Self-Service',
      reason || 'Customer requested cancellation',
      reason || 'Cancelled by user'
    );

    return res.json({ success: true, order: result.order, message: 'Order has been cancelled successfully.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 5. Admin Dashboard & Operations
app.get('/api/admin/stats', (_req: Request, res: Response) => {
  const stats = db.getDashboardStats();
  return res.json({ success: true, stats });
});

app.get('/api/admin/orders', (req: Request, res: Response) => {
  const { status, search, date } = req.query;
  let orders = db.getOrders();

  if (status && typeof status === 'string' && status !== 'All') {
    orders = orders.filter(o => o.orderStatus === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    orders = orders.filter(
      o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
    );
  }

  if (date && typeof date === 'string') {
    orders = orders.filter(o => o.createdAt.startsWith(date));
  }

  return res.json({ success: true, orders });
});

app.patch('/api/admin/orders/:id/status', (req: Request, res: Response) => {
  try {
    const { newStatus, updatedBy, note, cancellationReason } = req.body;
    if (!newStatus) {
      return res.status(400).json({ error: 'newStatus is required' });
    }

    const result = db.updateOrderStatus(
      req.params.id,
      newStatus as OrderStatus,
      updatedBy || 'Staff Member',
      note,
      cancellationReason
    );

    return res.json({
      success: true,
      order: result.order,
      deductionSummary: result.deductionSummary
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// Inventory
app.get('/api/admin/inventory', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    inventory: db.getInventory(),
    transactions: db.getInventoryTransactions().slice(0, 50)
  });
});

app.post('/api/admin/inventory/restock', (req: Request, res: Response) => {
  try {
    const { itemId, quantity, costPerUnit, performedBy, reason } = req.body;
    if (!itemId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid item ID and positive quantity are required' });
    }

    const result = db.restockInventory(
      itemId,
      Number(quantity),
      Number(costPerUnit) || 0,
      performedBy || 'Inventory Staff',
      reason || 'Routine stock intake'
    );

    if (!result) return res.status(404).json({ error: 'Inventory item not found' });
    return res.json({ success: true, item: result.item, transaction: result.transaction });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/inventory/transactions', (_req: Request, res: Response) => {
  return res.json({ success: true, transactions: db.getInventoryTransactions() });
});

// Suppliers
app.get('/api/admin/suppliers', (_req: Request, res: Response) => {
  return res.json({ success: true, suppliers: db.getSuppliers() });
});

app.post('/api/admin/suppliers', (req: Request, res: Response) => {
  try {
    const { name, contactPerson, phone, email, address, suppliedCategories } = req.body;
    if (!name) return res.status(400).json({ error: 'Supplier name is required' });

    const created = db.createSupplier({
      name: name.trim(),
      contactPerson: contactPerson || '',
      phone: phone || '',
      email: email || '',
      address: address || '',
      suppliedCategories: Array.isArray(suppliedCategories) ? suppliedCategories : ['Dairy'],
      isActive: true
    });

    return res.status(201).json({ success: true, supplier: created });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Customers
app.get('/api/admin/customers', (_req: Request, res: Response) => {
  const users = db.getUsers().filter(u => u.role === 'customer');
  const orders = db.getOrders();

  const customerStats = users.map(user => {
    const userOrders = orders.filter(o => o.customerId === user._id);
    const totalSpent = userOrders
      .filter(o => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const { passwordHash: _, ...safe } = user;
    return {
      ...safe,
      ordersCount: userOrders.length,
      totalSpent
    };
  });

  return res.json({ success: true, customers: customerStats });
});

app.patch('/api/admin/customers/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status || (status !== 'active' && status !== 'inactive')) {
    return res.status(400).json({ error: 'Status must be active or inactive' });
  }

  const updated = db.updateUser(req.params.id, { status });
  if (!updated) return res.status(404).json({ error: 'Customer not found' });
  return res.json({ success: true, user: updated });
});

// Staff
app.get('/api/admin/staff', (_req: Request, res: Response) => {
  const staff = db.getUsers().filter(u => u.role !== 'customer');
  const safeStaff = staff.map(s => {
    const { passwordHash: _, ...safe } = s;
    return safe;
  });
  return res.json({ success: true, staff: safeStaff });
});

app.post('/api/admin/staff', (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, role, password } = req.body;
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ error: 'Full name, email, role, and password are required' });
    }

    if (db.findUserByEmail(email)) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const created = db.createUser({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '+923000000000',
      passwordHash: bcrypt.hashSync(password, 10),
      role: role as Role,
      status: 'active',
      addresses: []
    });

    const { passwordHash: _, ...safe } = created;
    return res.status(201).json({ success: true, staff: safe });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// System reset to seed
app.post('/api/admin/system/reset', (_req: Request, res: Response) => {
  const result = db.resetToSeed();
  return res.json(result);
});

// Export ZIP archive
app.get('/api/admin/system/export-zip', async (_req: Request, res: Response) => {
  try {
    const zip = new JSZip();

    // Helper to recursively add files into zip
    const addDirToZip = (currentDir: string, zipFolder: JSZip) => {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        if (item === 'node_modules' || item === '.git' || item === 'dist' || item === '.cache') continue;
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          addDirToZip(fullPath, zipFolder.folder(item)!);
        } else {
          zipFolder.file(item, fs.readFileSync(fullPath));
        }
      }
    };

    addDirToZip(process.cwd(), zip);
    const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="pizza-house-complete-system.zip"');
    return res.send(content);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate ZIP: ' + err.message });
  }
});

// --- VITE MIDDLEWARE / STATIC ASSETS SETUP ---
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🍕 Pizza House Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
