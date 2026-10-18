# Implementation Plan - Course Feature Simplification

Simplify the Course system across both the User Course Store (`src/pages/Courses.tsx`) and the Admin Panel (`src/pages/Admin.tsx`), keeping only essential fields: **Title (টাইটেল)**, **Description (বিবরণ)**, **Price (মূল্য)**, **Discount Price (ডিসকাউন্ট মূল্য)**, and **Course/Drive Link (কোর্স লিংক)**.

---

## User Review Required

> [!IMPORTANT]
> All complex features such as nested video lessons/modules, video players, complex category chips, setup instructions, and app type distinctions will be removed from the UI and admin forms. Once unlocked, buyers will directly access their course via the provided course link.

---

## Key Proposed Changes

### 1. Data Model Simplification (`src/pages/Courses.tsx` & `src/pages/Admin.tsx`)
- Streamline `Course` interface:
  - `id?: string`
  - `title: string`
  - `description: string`
  - `price: number`
  - `discountPrice?: number`
  - `driveLink: string` (Course Link)
  - `thumbnailUrl?: string`
  - `status?: string`
- Remove unused fields: `items` (lessons array), `setupInstructions`, `accessKey`, `videoLink`, `category` filters, etc.

### 2. User Store UI (`src/pages/Courses.tsx`)
- **Store Cards:** Clean card layout displaying thumbnail, title, brief description, regular price, discounted price, and "Buy" button.
- **Course Unlocked View:** Once purchased/approved, display a prominent button to directly open the course link ("কোর্স এক্সেস করুন / ড্রাইভ লিংক").
- **Minimal Filters:** Simple search input by course title/description without crowded category tags or complex tabs.

### 3. Admin Management Panel (`src/pages/Admin.tsx`)
- **Simplified Add/Edit Form:** Form with only 5 fields:
  1. Course Title (কোর্সের নাম)
  2. Description (বিবরণ)
  3. Original Price (মূল দাম)
  4. Discount Price (ডিসকাউন্ট মূল্য)
  5. Course / Drive Link (কোর্স বা ড্রাইভ লিংক)
- **Admin Course Table:** Streamlined list of courses with fast Edit, Delete, and Status Toggle controls.

---

## Verification Plan

### Automated Tests & Validation
- Run `compile_applet` to verify TypeScript types and component compilation.
- Run `lint_applet` to ensure clean code standards.

### Manual Verification
- Test adding a course from the Admin panel with title, description, price, discount, and course link.
- Test purchasing the simplified course from the user frontend with wallet and bKash.
- Verify that clicking "কোর্স এক্সেস করুন" directly opens the saved course link.
