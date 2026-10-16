# Implementation Plan: Course & Premium App Marketplace

## Overview
Transform the existing tutorial-based "Courses" section into a full-featured **Digital Course & Premium App Marketplace**. Admins will be able to list courses (e.g., Animation, Graphics, Digital Skills) and Premium Applications (Pro/VIP apps, tools). Users can purchase them using bKash, Nagad, Rocket, or their app Wallet Balance, and immediately access their purchased content, video lessons, drive links, and license keys.

---

## User Review & Decision Points
Based on the clarifying questions:
1. **Management**: Only Admin will upload, price, and manage courses and apps.
2. **Payment Methods**: bKash, Nagad, Rocket manual payment (with Sender Number & TrxID) and in-app Wallet Balance.
3. **Content Access**: Immediate delivery & access directly inside the app in a dedicated "আমার কোর্স ও অ্যাপস (My Purchases)" dashboard, featuring a built-in video lesson player, Google Drive/download links, and setup guides.

---

## Proposed Architecture & Schema

### 1. Database Collections (`Firestore`)

#### A. `courses` collection (Digital Products)
```typescript
interface CourseOrApp {
  id: string;
  title: string;
  type: 'course' | 'premium_app'; // 'course' or 'premium_app'
  category: 'এনিমেশন' | 'গ্রাফিক্স ও ভিডিও' | 'ডিজিটাল মার্কেটিং' | 'প্রিমিয়াম অ্যাপস' | 'অন্যান্য';
  description: string;
  thumbnailUrl: string;
  price: number;               // Regular price in BDT (e.g. 500)
  discountPrice?: number;      // Promotional price (e.g. 250)
  driveLink?: string;          // Google Drive / Direct download URL
  accessKey?: string;          // Activation key or license code if applicable
  setupInstructions?: string;  // Setup instructions for apps or course guidance
  items?: {                    // Video modules / chapters (for courses)
    title: string;
    videoLink: string;
    description: string;
    duration?: string;
  }[];
  status: 'active' | 'inactive';
  salesCount?: number;
  createdAt: number;
}
```

#### B. `course_orders` collection (Purchases & Access)
```typescript
interface CourseOrder {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  courseType: 'course' | 'premium_app';
  thumbnailUrl: string;
  amount: number;
  paymentMethod: 'wallet' | 'bkash' | 'nagad' | 'rocket';
  senderNumber?: string;
  trxId?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;              // serverTimestamp
  updatedAt?: any;
}
```

---

## Step-by-Step Implementation Worklist

### Step 1: Update Firestore Rules (`firestore.rules`)
- Add rules for `/course_orders/{orderId}`:
  - `allow read`: if user is order owner (`isDataOwner(resource.data)`) or `isAdmin()`
  - `allow create`: if user is authenticated and order owner (`isDataOwner(request.resource.data)`)
  - `allow update, delete`: if `isAdmin()`

### Step 2: Redesign Course & Digital Store Page (`src/pages/Courses.tsx`)
- **Header & Navigation Tabs**:
  - `মার্কেটপ্লেস (Store)`: Browse available Animation courses, skill courses, and premium apps.
  - `আমার কোর্স ও অ্যাপস (My Purchases)`: Access unlocked videos, Drive links, and download keys.
- **Product Filter & Search**:
  - Filters: "সব (All)", "এনিমেশন (Animation)", "প্রিমিয়াম অ্যাপস (Premium Apps)", "মার্কেটিং ও স্কিল (Skills)".
  - Search bar to filter by title or keyword.
- **Product Card UI**:
  - Badge for Product Type (`কোর্স` / `প্রিমিয়াম অ্যাপ`).
  - Pricing display (Original Price with strike-through + Discounted Price).
  - Quick Feature list (e.g., "Full HD Video", "Direct Google Drive Access", "Lifetime Updates").
  - "বিস্তারিত দেখুন (View Details)" & "এখনই কিনুন (Buy Now)" buttons.
- **Checkout Modal**:
  - Payment method selector:
    - **ওয়ালেট ব্যালেন্স (Wallet Balance)**: Checks if user has sufficient main balance. One-click instant unlock!
    - **বিকাশ / নগদ / রকেট (Manual TrxID)**: Displays admin deposit numbers with one-click copy, instructions, Sender Number field, and TrxID field.
- **Content Viewer / Player**:
  - When accessing a purchased course: Video player with playlist of chapters/modules, drive resource link, and tutor notes.
  - When accessing a purchased premium app: Direct download link (Mediafire/Drive), activation key copy, and installation guide.

### Step 3: Enhance Admin Panel (`src/pages/Admin.tsx`)
- **Product Management (`Courses` Tab)**:
  - Form field to select product type: **অনলাইন কোর্স (Course)** vs **প্রিমিয়াম অ্যাপ (Premium App)**.
  - Price and Discount Price fields.
  - Download / Drive Link field (for apps & course materials).
  - Activation Key / Setup Notes field.
  - Video Chapter / Module builder (for multi-part courses).
  - Edit & delete existing products with active/inactive status toggle.
- **Course Orders Management**:
  - Add "কোর্স ও অ্যাপ অর্ডারস (Course Orders)" sub-tab or management table in Admin.
  - View all purchase requests with buyer details, phone number, TrxID, and course name.
  - Quick Actions: **Approve (অনুমোদন)**, **Reject (বাতিল)**.
  - Shows total revenue and order metrics.

### Step 4: Verification & Testing
- Test creating a course and a premium app in Admin.
- Test purchasing via Wallet Balance (balance deduction and instant access).
- Test purchasing via bKash/Nagad with TrxID submission.
- Test Admin order approval/rejection.
- Verify responsive layout across mobile and desktop.
- Run `compile_applet` and `lint_applet` to ensure zero compilation or type errors.
