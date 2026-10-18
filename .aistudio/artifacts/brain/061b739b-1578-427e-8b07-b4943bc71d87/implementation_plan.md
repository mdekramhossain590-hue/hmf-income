# Product Reselling (রিসেলিং) Feature Implementation Plan

Integrate a complete Product Reselling workflow allowing users to set custom resale prices with profit margins, submit customer delivery details, automatically apply a 120 BDT delivery fee on each user's first 2 orders, and allow admins to manage products and orders.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Resale Price & Profit Calculation**: Resellers set their own selling price to customers. Profit = `Resale Price - Wholesale Price`.
> - **First 2 Orders Delivery Charge Rule**: A 120 BDT delivery charge will automatically be added for the first 2 orders placed by each user. From the 3rd order onwards, standard wholesale delivery rules apply.
> - **Order Submission Workflow**: Resellers input customer name, phone number, full address, product variant/quantity, and custom selling price before submitting the order.

---

## 1. Overview & Core Concept

- **Goal**: Enable users to earn income by reselling physical/digital products available on the platform to their own customers.
- **Reseller Experience**:
  1. Browse available Reselling Products with wholesale prices, images, and descriptions.
  2. Input custom customer selling price (calculating reseller profit automatically).
  3. Enter customer delivery information (Name, Phone, Address, Note).
  4. Automatic 120 BDT delivery charge calculation for first 2 orders per user account.
  5. Track order status (Pending, Processing, Delivered, Cancelled) and earned profits.
- **Admin Experience**:
  1. Add/edit wholesale reselling products with wholesale prices, category, stock, and descriptions.
  2. View and update reseller orders, track delivery status, approve/payout reseller profits into user wallets.

---

## 2. Technical Architecture & Component Structure

```
┌────────────────────────────────────────────────────────┐
│                   Reselling Page                       │
│ ┌────────────────────────────────────────────────────┐ │
│ │  • Products Grid (Wholesale Price & Profit Calc)   │ │
│ │  • Order Modal (Customer Info & 120 BDT Fee Rule)  │ │
│ │  • My Reseller Orders & Profit History Tab         │ │
│ └────────────────────────────────────────────────────┘ │
└──────────────────────────┬─────────────────────────────┘
                           │ Saved to Firestore: reselling_orders & reselling_products
                           ▼
┌────────────────────────────────────────────────────────┐
│                 Admin Panel (Reselling)                │
│ ┌────────────────────────────────────────────────────┐ │
│ │  • Manage Reselling Products (Add/Edit Wholesale) │ │
│ │  • Manage Reseller Orders & Approve Profit Payouts │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### Planned Data Models (`reselling_products` & `reselling_orders`):
1. **`reselling_products`**:
   - `id`: string
   - `title`: string
   - `description`: string
   - `wholesalePrice`: number (পাইকারি মূল্য)
   - `minResalePrice`: number (সর্বনিম্ন রিসেল দাম)
   - `images`: string[]
   - `category`: string
   - `stock`: number
   - `createdAt`: timestamp
2. **`reselling_orders`**:
   - `id`: string
   - `resellerId`: string (User UID)
   - `resellerName`: string
   - `resellerEmail`: string
   - `productId`: string
   - `productTitle`: string
   - `wholesalePrice`: number
   - `resalePrice`: number
   - `profit`: number (`resalePrice - wholesalePrice`)
   - `deliveryFee`: number (120 BDT for first 2 orders per user, 0 or standard afterwards)
   - `orderNumberIndex`: number (1st, 2nd, etc. order for this user)
   - `customerName`: string
   - `customerPhone`: string
   - `customerAddress`: string
   - `customerNote`: string
   - `status`: `'pending' | 'processing' | 'delivered' | 'cancelled'`
   - `createdAt`: timestamp

---

## 3. Implementation Steps

1. **Navigation & Route (`src/App.tsx`, `src/components/Layout.tsx`, `src/pages/Dashboard.tsx`)**:
   - Add `/reselling` route and quick action button on Dashboard ("রিসেলিং").
2. **Reselling Page (`src/pages/Reselling.tsx`)**:
   - Product Catalog tab showing wholesale items.
   - Interactive Order Modal:
     - Real-time Profit Calculator (`Resale Price - Wholesale Price`).
     - Automated check of user's previous `reselling_orders` count:
       - If order count < 2 -> Delivery Fee = 120 BDT (প্রথম ২ টি অর্ডারে ১২০ টাকা ডেলিভারি চার্জ).
       - If order count >= 2 -> Delivery Fee = 0 or standard.
     - Customer Name, Mobile Number, Full Address, Special Note input fields.
   - Reseller Order History tab with live status tracking and profit summary.
3. **Admin Management (`src/pages/Admin.tsx`)**:
   - Add **"রিসেলিং প্রোডাক্টস ও অর্ডারস"** sub-tab under Admin Panel.
   - Add/Edit wholesale product listing form.
   - View reseller orders, update status (`delivered`, `cancelled`), and disburse profit to reseller wallet balance upon delivery.
4. **Verification**:
   - Run `compile_applet` and `lint_applet` to ensure zero compilation or build errors.

---

## 4. Verification Plan

- Run `compile_applet` to verify clean compilation.
- Run `lint_applet` to verify syntax and imports.
