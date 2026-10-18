# Admin Product Management & Reseller Order Form Implementation Plan

Add a full Admin Product Management suite (Add/Edit/Delete products with title, category, description, regular price, reseller price, image, and stock) and enhance the Reseller Order Form with customer delivery details and an advance delivery fee payment workflow (120 BDT for first 2 orders).

## User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed the following specific rules:
> 1. **Product Fields in Admin Panel**: Name, Category, Description, Regular Price, Reseller Price, Image URL, and Stock Quantity.
> 2. **Reseller Order Delivery Fee Rule**: Fixed 120 BDT advance delivery fee required for the user's **first 2 orders**. A dedicated payment number (Bkash/Nagad) and transaction ID input will be displayed in the order form. From order 3 onwards, standard charge applies.

---

## 1. Overview & Core Concept

- **Admin Product Management**:
  - A dedicated "Products" tab in `Admin.tsx` allowing admins to list, add, edit, and delete products available for reselling.
  - Full support for storing product details in Firestore (`products` collection).

- **Reseller Order Form (`OrderModal` / `ResellOrderModal`)**:
  - Resellers click "Resell" / "Order for Customer" on any course or product.
  - A modal/form collects Customer Name, Phone, Full Address, Reseller Selling Price (showing calculated profit = Selling Price - Reseller Cost).
  - Automatically calculates completed order count for the user. If `completedOrdersCount < 2`, requires **120 BDT Advance Delivery Fee** via Bkash/Nagad with dedicated payment numbers and Transaction ID verification.

---

## 2. User Experience & Visual Design

- **Admin Products View**:
  - Grid & table view of all products with stock status badges (In Stock / Out of Stock).
  - "Add New Product" modal with clean form fields:
    - Product Title / Name
    - Category (e.g., Electronics, Fashion, Digital Courses, Software)
    - Description
    - Regular Retail Price (৳)
    - Reseller Price (৳)
    - Stock Quantity
    - Image URL
  - Quick action buttons: Edit, Delete, Toggle Availability.

- **Reseller Order Flow**:
  - **Product Selection**: Reseller selects a product/course.
  - **Profit Calculator**: Input "Customer Selling Price". Shows real-time estimated profit: `Profit = Selling Price - Reseller Price`.
  - **Customer Details**: Form inputs for Customer Name, Mobile Number, Full Delivery Address, District/City, and Special Notes.
  - **Advance Fee Payment Banner (First 2 Orders)**:
    - Highlighted banner explaining: *"Your 1st/2nd Reseller Order requires BDT 120 advance delivery fee payment."*
    - Displays Bkash & Nagad personal/agent numbers provided in site settings.
    - Transaction ID / Payment proof input field.
  - **Submission & Toast**: Order is saved to `orders` collection in Firestore with status `pending`, tagged with `isResellOrder: true`, advance payment details, reseller profit, and customer information.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Firestore Collection for Products**:
  - *Chosen Approach*: Store products in a top-level Firestore collection `products`.
  - *Why*: Allows fast real-time synchronization (`onSnapshot`), direct admin manipulation, and instant loading on reseller catalog pages.

- **Decision 2: Order Count Tracking for Advance Fee Rule**:
  - *Chosen Approach*: Count existing orders for `user.uid` where `isResellOrder: true` and `status !== 'cancelled'`. If count < 2, mandate the 120 BDT advance payment step.
  - *Why*: Automated, tamper-proof check tied to the reseller's account history in Firestore.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   Admin Panel                           │
│  - Products Tab (Add / Edit / Delete / Stock)           │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
               ┌─────────────────────────┐
               │   Firestore Collection  │
               │   - /products           │
               │   - /orders             │
               │   - /settings/deposit   │
               └────────────┬────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                Reseller Catalog & Modal                 │
│  - Customer Info Form                                   │
│  - Real-time Profit Calculation                         │
│  - Advance 120 BDT Payment Step (First 2 Orders)        │
└────────────────────────────────────────────────────────┘
```

### Data Models

**Product Item (`products` collection)**:
```ts
interface ProductItem {
  id: string;
  title: string;
  category: string;
  description: string;
  regularPrice: number;
  resellerPrice: number;
  stock: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: any;
}
```

**Resell Order (`orders` collection)**:
```ts
interface ResellOrder {
  id: string;
  resellerUid: string;
  resellerEmail: string;
  productId: string;
  productTitle: string;
  resellerPrice: number;
  customerSellingPrice: number;
  resellerProfit: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  advanceFeePaid: number; // 120 BDT for first 2 orders, 0 otherwise
  trxId?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: any;
}
```
