# Database Refactoring Documentation & Implementation Plan

**Objective:** migrate the application from using legacy "Embedded Array" collections (`CourtCertification`, `Paddletestingforms`, `Balltestingforms`) to the new "Normalized" collection (`certification_orders`).

**Refactoring Scope:** 8 Files, 30+ changes.

---

## 1. Refactoring Audit

### A. Reader Components (Dashboards & Lists)
These components are currently reading from the old empty/legacy collections and showing 0 results.

| File Path | Current Logic | New Logic | Priority |
| :--- | :--- | :--- | :--- |
| `src/app/admin/(dashboard)/dashboard/page.jsx` | Reads all 3 legacy collections. Loops through `processedOrders`. | Query `certification_orders` directly. Sort by recent date. | **High** |
| `src/app/admin/(dashboard)/statistics/page.jsx` | Reads all collections to sum totals. | Use `count()` or `sum()` queries on `certification_orders`. | **High** |
| `src/app/admin/(dashboard)/process-orders/page.jsx` | Fetches orders from legacy collections. | Query `certification_orders`. | **High** |
| `src/app/my-orders/page.jsx` | Fetches user document, then `processedOrders`. | Query `certification_orders` where `userId == auth.uid`. | **Medium** |

### B. Writer Components (Forms & Cart)
These components are saving new data to the old structure, which will become "hidden" from the new dashboard.

| File Path | Current Logic | New Logic | Priority |
| :--- | :--- | :--- | :--- |
| `src/app/forms/court-certification/application-form/page.jsx` | `updateDoc` with `arrayUnion`. | `setDoc(doc(db, "certification_orders", ID))` | **High** |
| `src/app/forms/pickle-ball-paddle-testing/application-form/page.jsx` | `updateDoc` with `arrayUnion`. | `setDoc(doc(db, "certification_orders", ID))` | **High** |
| `src/app/forms/pickle-ball-testing/application-form/page.jsx` | `updateDoc` with `arrayUnion`. | `setDoc(doc(db, "certification_orders", ID))` | **High** |
| `src/app/my-cart/page.jsx` | Reads/Writes cart to legacy doc. Moves to `processedOrders`. | Cart can stay in user doc (optional) OR move to new collection. Checkout **MUST** write to `certification_orders`. | **Medium** |

### C. Logic & Contexts
| File Path | Current Logic | New Logic | Priority |
| :--- | :--- | :--- | :--- |
| `src/app/contexts/CartContext.js` | Fetches cart from all 3 legacy collections. | Refactor to fetch cart from a unified location or keep legacy access JUST for cart. | **Low** |
| `src/app/aipa-approved/*` | Reads certified products from legacy. | Query `certification_orders` where `status == "Approved"`. | **Low** |

---

## 2. Implementation Steps

### Step 1: Admin Dashboard Refactoring
**Why:** To confirm data visibility immediately.
*   **Action:** Update `fetchOrders` in `dashboard/page.jsx` to query `certification_orders`.
*   **Verification:** Dashboard should show 42+ orders (from migration).

### Step 2: Form Submission Update
**Why:** To ensure new orders go to the right place.
*   **Action:** Update `handleSubmit` in all 3 form pages.
*   **Code:**
    ```javascript
    // Old
    await updateDoc(userDocRef, { processedOrders: arrayUnion(order) });

    // New
    await setDoc(doc(db, "certification_orders", orderId), {
      ...order,
      userId: user.uid,
      type: "Court" // "Paddle" / "Ball"
    });
    ```

### Step 3: My Orders Page Refactoring
**Why:** So users see their history.
*   **Action:** Rewrite `fetchProcessedOrders` to use a simple Firestore Query (`where("userId", "==", uid)`).

### Step 4: Cleanup & Cart
**Why:** Cart logic is complex and creates legacy documents.
*   **Action:** Update `my-cart` checkout process to write to `certification_orders` upon payment success.

---

## 3. Verification Plan

1.  **Read Verification:**
    *   **Automated:** Run `npm run test` (if available) or create a script to dry-run the queries.
    *   **Manual:** Load Admin Dashboard.
        *   **PASS:** If it shows > 0 orders.
        *   **FAIL:** If it shows 0 orders or errors.

2.  **Write Verification:**
    *   **Manual:** Submit a new "Test Court Application".
        *   Check Admin Dashboard.
        *   **PASS:** If new order appears at top of list.
        *   **FAIL:** If it doesn't appear.
