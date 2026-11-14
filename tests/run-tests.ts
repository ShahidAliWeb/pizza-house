/**
 * Automated Test Suite for Pizza House
 * Runs end-to-end integration tests on authentication, cart logic, orders, recipe deduction, and admin operations.
 */
import { PizzaHouseDatabase, generateObjectId } from '../server/db.js';
import bcrypt from 'bcryptjs';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🍕 PIZZA HOUSE AUTOMATED TEST SUITE');
  console.log('======================================================\n');

  const testDb = new PizzaHouseDatabase();
  testDb.resetToSeed();

  // Test 1: Customer Registration & Duplicate Prevention
  console.log('--- 1. Customer Registration & Duplicate Prevention ---');
  const existingUser = testDb.findUserByEmail('usman.tahir@example.pk');
  assert(!!existingUser, 'Existing seeded customer Usman Tahir exists');

  const newUser = testDb.createUser({
    fullName: 'Hamza Farooq',
    email: 'hamza.test@example.pk',
    phone: '+923007654321',
    passwordHash: bcrypt.hashSync('Pass@123', 10),
    role: 'customer',
    status: 'active',
    addresses: []
  });
  assert(newUser.email === 'hamza.test@example.pk', 'New customer registration created');
  assert(newUser.phone === '+923007654321', 'Customer phone stored correctly as string');

  // Duplicate check
  const duplicate = testDb.findUserByEmail('hamza.test@example.pk');
  assert(duplicate?._id === newUser._id, 'Duplicate query correctly identifies existing email');

  // Test 2: Login & Password Hashing Verification
  console.log('\n--- 2. Login & Password Verification ---');
  const validPass = bcrypt.compareSync('Pass@123', newUser.passwordHash);
  assert(validPass, 'Correct password verifies successfully against bcrypt hash');
  const invalidPass = bcrypt.compareSync('WrongPassword', newUser.passwordHash);
  assert(!invalidPass, 'Invalid password is firmly rejected');

  // Test 3: Admin Authorization & Roles
  console.log('\n--- 3. Admin Authorization & Roles ---');
  const admin = testDb.findUserByEmail('admin@pizzahouse.pk');
  assert(admin?.role === 'super_admin', 'Admin user has super_admin role');
  const manager = testDb.findUserByEmail('tariq.manager@pizzahouse.pk');
  assert(manager?.role === 'manager', 'Manager user has manager role');
  const staff = testDb.findUserByEmail('bilal.kitchen@pizzahouse.pk');
  assert(staff?.role === 'order_staff', 'Chef has order_staff role');

  // Test 4: Pizza Menu CRUD & Price Editing
  console.log('\n--- 4. Pizza Menu CRUD & Price Editing ---');
  const initialCount = testDb.getPizzas().length;
  assert(initialCount >= 8, 'Initial menu contains at least 8 pizzas');

  const tikka = testDb.getPizzas().find(p => p.sku === 'PH-PIZ-01');
  assert(tikka?.sizes.small === 799 && tikka?.sizes.medium === 1199 && tikka?.sizes.large === 1699, 'Chicken Tikka has correct seeded PKR prices (799, 1199, 1699)');

  // Update price
  const updatedPizza = testDb.updatePizza(tikka!._id, {
    sizes: { small: 849, medium: 1249, large: 1749 }
  });
  assert(updatedPizza?.sizes.small === 849, 'Price update reflects in pizza model');

  // Reset price back
  testDb.updatePizza(tikka!._id, {
    sizes: { small: 799, medium: 1199, large: 1699 }
  });

  // Test 5: Cart & Order Totals with Coupon Calculation
  console.log('\n--- 5. Cart & Order Totals with Coupon Calculation ---');
  const coupon = testDb.findCouponByCode('WELCOME10');
  assert(!!coupon && coupon.isActive, 'WELCOME10 coupon is active');

  // Place order with customer Usman Tahir
  const createdOrder = testDb.createOrder({
    customerId: existingUser!._id,
    customerName: existingUser!.fullName,
    customerEmail: existingUser!.email,
    customerPhone: existingUser!.phone,
    deliveryAddress: existingUser!.addresses[0],
    orderNotes: 'Urgent delivery for party',
    items: [
      { pizzaId: tikka!._id, size: 'Large', quantity: 2 } // 1699 * 2 = 3398
    ],
    couponCode: 'WELCOME10',
    paymentMethod: 'Cash on Delivery'
  });

  assert(createdOrder.subtotal === 3398, `Subtotal calculated accurately as 3398 (got ${createdOrder.subtotal})`);
  assert(createdOrder.deliveryFee === 0, 'Free delivery applied because subtotal > PKR 2500');
  assert(createdOrder.taxAmount === Math.round(3398 * 0.05), '5% Sales tax calculated correctly');
  assert(createdOrder.discountAmount === 340, `10% coupon discount calculated as 340 (got ${createdOrder.discountAmount})`);
  assert(createdOrder.grandTotal === 3398 + 0 + Math.round(3398 * 0.05) - 340, 'Grand total matches formula: Subtotal + Fee + Tax - Discount');
  assert(createdOrder.orderStatus === 'Pending', 'New order starts in Pending status');
  assert(!createdOrder.inventoryDeducted, 'Inventory not deducted yet while in Pending status');

  // Test 6: Order Status Transition & Recipe Ingredient Deduction
  console.log('\n--- 6. Recipe Ingredient Deduction on Order Confirmation ---');
  const flourBefore = testDb.findInventoryItemById('inv-flour')!.stockQuantity;
  const cheeseBefore = testDb.findInventoryItemById('inv-mozzarella')!.stockQuantity;
  const chickenBefore = testDb.findInventoryItemById('inv-chicken')!.stockQuantity;

  // Confirm order
  const confirmResult = testDb.updateOrderStatus(
    createdOrder._id,
    'Confirmed',
    'Tariq Mehmood',
    'Order accepted by manager'
  );

  assert(confirmResult.order.orderStatus === 'Confirmed', 'Order transitioned to Confirmed');
  assert(confirmResult.order.inventoryDeducted === true, 'Order marked with inventoryDeducted = true');

  const flourAfter = testDb.findInventoryItemById('inv-flour')!.stockQuantity;
  const cheeseAfter = testDb.findInventoryItemById('inv-mozzarella')!.stockQuantity;
  const chickenAfter = testDb.findInventoryItemById('inv-chicken')!.stockQuantity;

  // 2 Large Chicken Tikka: 2 * 380g flour = 0.76kg flour, 2 * 260g cheese = 0.52kg, 2 * 210g chicken = 0.42kg
  assert(flourAfter < flourBefore, `Flour stock deducted (was ${flourBefore}kg, now ${flourAfter}kg)`);
  assert(cheeseAfter < cheeseBefore, `Cheese stock deducted (was ${cheeseBefore}kg, now ${cheeseAfter}kg)`);
  assert(chickenAfter < chickenBefore, `Chicken stock deducted (was ${chickenBefore}kg, now ${chickenAfter}kg)`);

  // Verify duplicate deduction prevention
  testDb.updateOrderStatus(createdOrder._id, 'Preparing', 'Bilal Ahmed', 'In oven now');
  const flourAfterPreparing = testDb.findInventoryItemById('inv-flour')!.stockQuantity;
  assert(flourAfterPreparing === flourAfter, 'Duplicate ingredient deduction prevented when moving from Confirmed to Preparing');

  // Test 7: Cancellation & Stock Restoration
  console.log('\n--- 7. Order Cancellation & Stock Restoration ---');
  // Create another order to test cancellation restoration
  const orderToCancel = testDb.createOrder({
    customerId: existingUser!._id,
    customerName: existingUser!.fullName,
    customerEmail: existingUser!.email,
    customerPhone: existingUser!.phone,
    deliveryAddress: existingUser!.addresses[0],
    items: [{ pizzaId: tikka!._id, size: 'Small', quantity: 1 }],
    paymentMethod: 'Cash on Delivery'
  });

  // Confirm to deduct
  testDb.updateOrderStatus(orderToCancel._id, 'Confirmed', 'Admin');
  const flourBeforeCancel = testDb.findInventoryItemById('inv-flour')!.stockQuantity;

  // Cancel with recorded reason
  const cancelResult = testDb.updateOrderStatus(
    orderToCancel._id,
    'Cancelled',
    'Admin',
    'Customer called to cancel',
    'Customer changed mind'
  );

  assert(cancelResult.order.orderStatus === 'Cancelled', 'Order transitioned to Cancelled');
  assert(cancelResult.order.cancellationReason === 'Customer changed mind', 'Cancellation reason saved');
  const flourAfterCancel = testDb.findInventoryItemById('inv-flour')!.stockQuantity;
  assert(flourAfterCancel > flourBeforeCancel, `Stock restored upon cancellation (was ${flourBeforeCancel}kg, now ${flourAfterCancel}kg)`);

  // Test 9: 14 Fast Food Categories & Category CRUD
  console.log('\n--- 9. 14 Fast Food Categories & Category Operations ---');
  const allCategories = testDb.getCategories();
  assert(allCategories.length >= 14, `All 14 Fast Food categories exist (found ${allCategories.length})`);
  const burgerCat = allCategories.find(c => c.name.toLowerCase() === 'burgers');
  assert(!!burgerCat, 'Burgers category exists');
  const rollsCat = allCategories.find(c => c.name.toLowerCase() === 'rolls & wraps');
  assert(!!rollsCat, 'Rolls & Wraps category exists');

  // Create new category dynamically
  const newCat = testDb.createCategory({
    name: 'Kids Meal Deals',
    slug: 'kids-meal-deals',
    description: 'Fun combos with toys and juice for kids',
    image: '🎁',
    displayOrder: 15,
    isActive: true
  });
  assert(newCat.slug === 'kids-meal-deals', 'Admin can dynamically create new category');

  // Toggle category
  const toggledCat = testDb.toggleCategory(newCat._id);
  assert(toggledCat?.isActive === false, 'Category can be toggled inactive');

  // Test 10: Fast Food Menu Items & Single Price Item Ordering
  console.log('\n--- 10. Fast Food Menu Items & Single Price Item Ordering ---');
  const allFoodItems = testDb.getPizzas();
  assert(allFoodItems.length >= 50, `Catalog populated with fast food items (found ${allFoodItems.length} items)`);

  const zingerBurger = allFoodItems.find(i => i.name.toLowerCase() === 'zinger burger');
  assert(!!zingerBurger, 'Zinger Burger exists in menu');
  assert(zingerBurger?.hasSizes === false, 'Zinger burger configured as standard single portion');
  assert((zingerBurger?.price || 0) > 0, `Zinger burger has valid PKR price (${zingerBurger?.price})`);

  // Place order for Zinger Burger and a Drink (single price items)
  const mintMargarita = allFoodItems.find(i => i.name.toLowerCase() === 'mint margarita');
  assert(!!mintMargarita, 'Mint Margarita drink exists in menu');

  const fastFoodOrder = testDb.createOrder({
    customerId: existingUser!._id,
    customerName: existingUser!.fullName,
    customerEmail: existingUser!.email,
    customerPhone: existingUser!.phone,
    deliveryAddress: existingUser!.addresses[0],
    orderNotes: 'Deliver extra spicy with cold drink',
    items: [
      { pizzaId: zingerBurger!._id, size: 'Regular', quantity: 2 },
      { pizzaId: mintMargarita!._id, size: 'Regular', quantity: 1 }
    ],
    paymentMethod: 'Cash on Delivery'
  });

  const expectedSubtotal = (zingerBurger!.price! * 2) + mintMargarita!.price!;
  assert(fastFoodOrder.subtotal === expectedSubtotal, `Fast food order subtotal matches sum of single-price items (${expectedSubtotal} PKR)`);
  assert(fastFoodOrder.items.length === 2, 'All fast food items verified in order');

  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
