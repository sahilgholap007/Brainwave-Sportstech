# Project Audit & Improvement Plan

## Executive Summary
A comprehensive review of the `brainwave-sportstech` project reveals a functional application built with Next.js 15 and Firebase. However, there are significant opportunities for improvement in **security**, **architecture**, and **maintainability**.

> [!CRITICAL]
> **Security Vulnerability**: Current Firebase Storage rules allow **public write access** (`if true`). Firestore rules allow any authenticated user to read/write all data. These must be addressed immediately.

## Proposed Improvements

### 1. Security Hardening (High Priority)
-   **Storage Rules**: Restrict upload access to authenticated users and specific file types/sizes. Implement folder-based access control (e.g., only admins can upload specific assets).
-   **Firestore Rules**: Implement Role-Based Access Control (RBAC).
    -   **Users**: Can only read/write their own data.
    -   **Admins**: Full access to `certification_orders` and `ManualBills`.
-   **API Security**: Ensure all API routes (e.g., `createOrder`) validate input strictly (Zod is installed, should be used consistently).

### 2. Architecture & Refactoring (Medium Priority)
-   **Break Down Monoliths**:
    -   `ManualBillGenerator.jsx` (1300+ lines) is too large. Split into sub-components:
        -   `invoice-form/CustomerDetails.jsx`
        -   `invoice-form/ItemsTable.jsx`
        -   `invoice-form/InvoiceSummary.jsx`
    -   `ProcessOrders/page.jsx` (1800+ lines) should be refactored to extract:
        -   `OrderFilters.jsx`
        -   `OrdersTable.jsx`
        -   `EditOrderModal.jsx`
-   **Service Layer Pattern**:
    -   Currently, Firebase `getDocs`/`addDoc` calls are scattered in UI components.
    -   **Action**: Create `src/services/` (e.g., `orderService.js`, `invoiceService.js`) to centralize DB interactions. This improves testability and separation of concerns.

### 3. Code Quality & Maintainability (Medium Priority)
-   **Centralize Constants**:
    -   Tax Logic (Maharashtra 9%+9% vs IGST 18%) is hardcoded in multiple files.
    -   **Action**: Create `src/config/constants.js` or `src/utils/taxUtils.js` to manage tax rates, state lists, and business rules.
-   **Typing**: While full TypeScript migration might be heavy, adding JSDoc annotations to core utils and services will improve developer experience and reduce errors.

### 4. Performance & Optimization (Low Priority)
-   **Dynamic Imports**: Large libraries like `jspdf` and `html2canvas` should be dynamically imported to reduce the initial bundle size of the Admin Dashboard.
-   **Image Optimization**: Continue using `next/image`. Ensure all external domains are whitelisted in `next.config.mjs` (currently looks good).

## Roadmap

### Phase 1: Security Fixes
1.  [ ] Update `storage.rules` to deny public writes.
2.  [ ] Update `firestore.rules` to enforce RBAC.

### Phase 2: Refactoring Core Admin Features
1.  [ ] Refactor `ManualBillGenerator` into smaller components.
2.  [ ] Extract Firebase logic from `ProcessOrders` to `src/services/orderService.js`.

### Phase 3: Cleanup & Standardization
1.  [ ] Create `taxUtils.js` and replace hardcoded logic.
2.  [ ] Standardize API error handling (using `errorHandler.js` consistently).

## User Review Required
-   **Security**: Please confirm if you have a custom "Admin" claim or role in Firebase Auth, or if we should define admins by a specific email list/collection.
-   **Business Logic**: Confirm if the hardcoded tax logical (Maharashtra split) is the only special case.
