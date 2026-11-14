# Pizza House – Real-World Restaurant Management & Online Ordering System

A production-oriented commercial ordering and restaurant management platform designed specifically for the Pakistani food market.

Built with **Node.js, Express, React, TypeScript, Tailwind CSS, and MongoDB/Mongoose architecture**.

---

## 🍕 Key Features

### 1. Customer Ordering & Experience
- **Authentic Pakistani Pizza Menu**: Chicken Tikka, Malai Boti, Chicken Fajita, Creamy Tikka, Pepperoni Feast, Cheese Lover, BBQ Chicken, and Vegetarian Farmhouse.
- **Dynamic Size & Pricing**: Three distinct crust sizes (Small, Medium, Large) in Pakistani Rupees (PKR) with live price updates.
- **Shopping Cart & Checkout**:
  - Quantity steppers, remove items, coupon discounts (e.g. `WELCOME10`, `PIZZAFEST`).
  - Delivery fee logic (Free delivery over PKR 2,500, otherwise PKR 150).
  - Provincial Sales Tax calculation (PRA / SRB approx 5%).
- **Delivery Address in Pakistan**:
  - House/Flat Number, Street, Area (e.g. DHA Phase 5, Gulshan-e-Iqbal, Gulberg, F-7), City (Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Peshawar), Province, Postal Code, and Delivery Instructions.
- **Payment Options**:
  - Cash on Delivery (COD).
  - Direct Bank Transfer (Meezan Bank Ltd / HBL with official account details & IBAN).
  - Online Card Payments.
- **Live 6-Step Order Tracker**:
  - Visual status timeline: `Pending` → `Confirmed` → `Preparing` → `Ready for Pickup` → `Out for Delivery` → `Delivered` (or `Cancelled`).
  - Audit trail with timestamps and kitchen staff members.
  - Printable Commercial Tax Invoice modal with STRN and NTN details.
  - Self-service cancellation for Pending or Confirmed orders with recorded reason.

### 2. Commercial Admin & Kitchen Dashboard
- **Executive KPI Analytics**: Total Revenue (PKR), Today's Revenue, Total Orders, Today's Orders, In Oven/Prep, Low Stock Alerts, and Top 5 Popular Pizzas.
- **Order Management**: Search by order number, customer name, phone number, filter by status and date, advance workflow status, print tax invoices.
- **Automated Recipe Ingredient Consumption**:
  - Confirmed and Preparing orders automatically deduct ingredients (flour, mozzarella cheese, chicken, pizza sauce, vegetables, boxes) based on pizza size recipe specs.
  - Duplicate deductions are prevented.
  - If an order is cancelled after deduction, ingredients are automatically restored to stock!
  - Full inventory audit log (`ORDER_DEDUCTION`, `CANCELLATION_RESTORE`, `RESTOCK`).
- **Menu Management**: Full CRUD for pizzas, price edits across Small, Medium, Large, and availability toggles.
- **Customer & Staff Management**: Track spend, activate/deactivate accounts, and assign role-based permissions (`super_admin`, `admin`, `manager`, `order_staff`).
- **System Backup**: Instant 1-click Download Complete Project Source Code (ZIP).

---

## ⚙️ Seed Accounts for Testing

| Role | Email | Password | Details |
|---|---|---|---|
| **Super Admin** | `admin@pizzahouse.pk` | `Admin@123456` | Full administrative control |
| **Branch Manager** | `tariq.manager@pizzahouse.pk` | `Manager@123456` | Orders, Inventory & Reports |
| **Kitchen Chef** | `bilal.kitchen@pizzahouse.pk` | `Staff@123456` | Kitchen Terminal & Status workflow |
| **Customer** | `usman.tahir@example.pk` | `Customer@123` | Karachi saved addresses & history |
| **Customer** | `ayesha.khan@example.pk` | `Customer@123` | Lahore saved addresses & history |

*(A quick 1-click test account switcher is also provided in the Sign In modal).*

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Clone & Install
```bash
git clone <repository-url>
cd pizza-house
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your configuration:
```env
PORT=3000
NODE_ENV=development
APP_URL="http://localhost:3000"
```

### 3. Run Automated Tests
Execute the comprehensive test suite verifying registration, password hashing, cart formulas, order lifecycle, recipe inventory deductions, and cancellation restores:
```bash
npm test
```

### 4. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 📦 Project Architecture

```
├── data/                      # Persistent JSON Document Store
│   └── pizza_house_db.json
├── models/                    # MongoDB / Mongoose Schemas
│   └── schemas.ts
├── server/                    # Backend Data Engine & Types
│   ├── db.ts                  # Query engine, transactions, recipe deductions
│   └── types.ts               # Data types & interfaces
├── src/                       # Frontend React + Tailwind SPA
│   ├── assets/images/         # High-resolution pizza photography
│   ├── components/            # Header, Footer, PizzaCard, CartDrawer, InvoiceModal, AuthModal
│   ├── context/               # AuthContext, CartContext
│   ├── pages/                 # CustomerHome, Checkout, Account, Deals, About, Tracking
│   │   └── admin/             # AdminPortal (Dashboard, Orders, Menu, Inventory, Staff)
│   ├── api.ts                 # Typed fetch client
│   ├── App.tsx                # Master router
│   ├── main.tsx
│   └── index.css
├── tests/                     # Automated Test Suite
│   └── run-tests.ts
├── package.json
├── server.ts                  # Express server mounting Vite middlewares
├── tsconfig.json
└── vite.config.ts
```

---

## 🔒 Security & Data Integrity
- Passwords securely hashed with **bcrypt** (salt rounds = 10).
- Authoritative server-side price and total calculations.
- Strict Pakistani phone number validation (`+923XXXXXXXXX`).
- Role-based authorization gates for sensitive admin operations.
