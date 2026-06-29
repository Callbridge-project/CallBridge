# MedDeliv Storefront — Developer Handoff Guide

> **Scope of this guide**: You are responsible for the **UI design and implementation**. The business logic (API calls, state management, routing, auth flows) is already written. This guide documents exactly how that logic works so you can wire your UI against it without guessing.

---

## 1. Getting Started

### Prerequisites
- Node.js 18+
- Access to the Git repository

### Environment Setup

Create a `.env.local` file in the project root:

```bash
# Toggle mock API (use 'true' for local development without a backend)
VITE_USE_MOCK_API=true

# Live backend base URL (leave empty when using mock)
VITE_API_URL=https://api.yourbackend.com

# Fallback API key for single-tenant mode
VITE_TENANT_API_KEY=your_key_here
```

### Running Locally

```bash
cd medDeliv-storefront
npm install
npm run dev
```

### Mock API

The project ships with a complete in-memory mock API (`src/api/mock.ts`) powered by **MSW (Mock Service Worker)**. When `VITE_USE_MOCK_API=true`, all API calls are intercepted and served locally — no backend needed.

To switch to the live backend:
```bash
VITE_USE_MOCK_API=false
VITE_API_URL=https://your-real-backend.com
```

> **Test credentials for the Rider Portal (mock mode):**
> - Email: `rider@meddeliv.com`
> - Password: `password123`

---

## 2. Project Structure

```
src/
├── App.tsx                  ← Route definitions (all routes are defined here)
├── main.tsx                 ← App entry point, providers, mock API toggle
├── api/
│   ├── client.ts            ← Axios instance with auth interceptors
│   └── mock.ts              ← Full mock API handlers
├── store/                   ← Zustand state stores (the logic lives here)
│   ├── authStore.ts         ← Customer authentication
│   ├── riderStore.ts        ← Rider authentication + cash tracking
│   ├── cartStore.ts         ← Shopping cart state
│   ├── locationStore.ts     ← Campus/location selection
│   ├── layoutStore.ts       ← UI layout state (sidebar open/close, etc.)
│   └── themeStore.ts        ← Theme preference
├── layouts/                 ← Route-level layout wrappers
│   ├── MarketplaceLayout.tsx ← Wraps all public storefront pages
│   ├── CheckoutLayout.tsx   ← Minimal header for Cart + Checkout
│   ├── AuthLayout.tsx       ← Wraps customer login/register
│   └── RiderLayout.tsx      ← Wraps all rider portal pages
├── pages/
│   ├── Home.tsx             ← Marketplace homepage
│   ├── PharmacyList.tsx     ← Browse pharmacies
│   ├── PharmacyStorefront.tsx ← Single pharmacy product listing
│   ├── ProductDetail.tsx    ← Individual product page
│   ├── SearchResults.tsx    ← Search results page
│   ├── Cart.tsx             ← Cart page
│   ├── Checkout.tsx         ← Multi-step checkout (THE most complex page)
│   ├── MyOrders.tsx         ← Customer's order history
│   ├── OrderDetail.tsx      ← Customer's single order detail
│   ├── Profile.tsx          ← Customer profile page
│   ├── MyPrescriptions.tsx  ← Customer prescriptions
│   └── rider/
│       ├── Login.tsx        ← Rider login (standalone, no layout wrapper)
│       ├── Dashboard.tsx    ← Order pool + active runs
│       ├── OrderDetail.tsx  ← Delivery action page
│       ├── Earnings.tsx     ← Earnings ledger + cash settlements
│       └── ProfileSettings.tsx ← Rider profile + password change
└── components/              ← UI components (yours to redesign)
```

---

## 3. Routing Overview

All routes are defined in `src/App.tsx`. **Do not change the route paths** — they are used by the API for redirects and deep links.

| Path | Page | Auth Required | Layout |
|------|------|--------------|--------|
| `/` | Home | No | `MarketplaceLayout` |
| `/pharmacies` | Pharmacy List | No | `MarketplaceLayout` |
| `/pharmacies/:slug` | Pharmacy Storefront | No | `MarketplaceLayout` |
| `/pharmacies/:slug/products/:productId` | Product Detail | No | `MarketplaceLayout` |
| `/search` | Search Results | No | `MarketplaceLayout` |
| `/cart` | Cart | No | `CheckoutLayout` |
| `/checkout` | Checkout | No | `CheckoutLayout` |
| `/orders` | My Orders | ✅ Customer | `MarketplaceLayout` |
| `/orders/:id` | Order Detail | ✅ Customer | `MarketplaceLayout` |
| `/profile` | Customer Profile | ✅ Customer | `MarketplaceLayout` |
| `/prescriptions` | My Prescriptions | ✅ Customer | `MarketplaceLayout` |
| `/login` | Customer Login | No | `AuthLayout` |
| `/register` | Customer Register | No | `AuthLayout` |
| `/rider/login` | Rider Login | No | None (standalone) |
| `/rider/dashboard` | Rider Dashboard | ✅ Rider | `RiderLayout` |
| `/rider/orders/:id` | Rider Order Detail | ✅ Rider | `RiderLayout` |
| `/rider/earnings` | Rider Earnings | ✅ Rider | `RiderLayout` |
| `/rider/profile` | Rider Profile Settings | ✅ Rider | `RiderLayout` |

### Auth Guards
- `ProtectedRoute` — redirects unauthenticated **customers** to `/login`
- `RiderProtectedRoute` — redirects unauthenticated **riders** to `/rider/login`

---

## 4. State Management (Zustand Stores)

All state lives in `src/store/`. These are **Zustand** stores with `persist` middleware — state survives page refreshes via `localStorage`.

### 4.1 `authStore` — Customer Auth
**File:** `src/store/authStore.ts`
**localStorage key:** `meddeliv-storefront-auth`

```typescript
// Shape
{
  token: string | null;
  customer: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  } | null;
  guestDetails: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  } | null;
  isAuthenticated: boolean;
}

// Actions
login(token, customer)      // Call after successful API login
logout()                    // Clears all auth state
setGuestDetails(details)    // Store guest info during checkout
clearGuestDetails()         // Reset guest after order placed
```

**Usage in components:**
```tsx
import { useAuthStore } from '@/store/authStore';

const { customer, isAuthenticated } = useAuthStore();
const { login, logout } = useAuthStore();
```

---

### 4.2 `riderStore` — Rider Auth + Cash Tracking
**File:** `src/store/riderStore.ts`
**localStorage key:** `meddeliv-rider-auth`

```typescript
// Shape
{
  token: string | null;
  rider: {
    id: string;
    name: string;
    phone: string;
    email: string;
  } | null;
  isAuthenticated: boolean;
  cashInHand: number;  // Running total of COD cash collected
}

// Actions
login(token, rider)         // Called after API login returns rider + token
logout()                    // Clears all rider state including cashInHand
addCash(amount)             // Called when a COD delivery is confirmed
clearCash()                 // Called when rider settles cash with admin
updateProfile(partial)      // Merge-update rider profile fields
```

> **Note on `cashInHand`:** This value is persistent. It accumulates across sessions until `clearCash()` is called. This is intentional — riders carry collected cash across shifts.

---

### 4.3 `cartStore` — Shopping Cart
**File:** `src/store/cartStore.ts`
**localStorage key:** `meddeliv-storefront-cart`

```typescript
// Shape
{
  items: Array<{
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    pharmacy_slug: string;
    pharmacy_name: string;
    requires_rx: boolean;
    image_url?: string;
  }>;
  pharmacySlug: string | null;   // The pharmacy the current cart belongs to
  pharmacyName: string | null;   // Human-readable name for conflict alerts
}

// Actions
addItem(item) → { conflict: boolean; existingPharmacy?: string | null }
removeItem(productId)
updateQuantity(productId, quantity)  // Setting qty <= 0 removes the item
clearCart()
```

#### Key Business Rule: Single-Pharmacy Cart
The cart enforces that **all items must come from the same pharmacy.** If a customer tries to add a product from a different pharmacy, `addItem()` returns `{ conflict: true, existingPharmacy: "..." }` without modifying the cart.

**You must handle this in the UI:**
```tsx
const result = addItem(newItem);
if (result.conflict) {
  // Show a modal: "Your cart has items from [existingPharmacy].
  // Clear cart and start fresh?"
  // On confirm → clearCart() then addItem(newItem) again
}
```

---

### 4.4 `locationStore` — Campus Selection
**File:** `src/store/locationStore.ts`
**localStorage key:** `meddeliv-storefront-location`

```typescript
// Shape
{
  selectedCampus: {
    id: string;
    name: string;
    city: string;
    slug: string;
    lat?: number;
    lng?: number;
  } | null;
}

// Actions
setCampus(campus)
clearCampus()
```

**`SINGLE_CAMPUS_MODE`**: There is a constant `SINGLE_CAMPUS_MODE = true` in this file. When `true`, the app is locked to UG Legon campus and the campus selection modal is suppressed. When `false`, show a campus picker modal (`src/components/shared/LocationModal.tsx`) on first visit if no campus is selected.

---

## 5. API Client

**File:** `src/api/client.ts`

The API client is a pre-configured Axios instance. **Never create a new Axios instance** — always import this one:

```tsx
import apiClient from '@/api/client';

// Example usage
const res = await apiClient.get('/public/pharmacies?university_id=1');
const data = res.data.data; // All API responses wrap data in { data: { data: ... } }
```

### What the interceptors do automatically
1. **Request**: Attaches `Authorization: Bearer <token>` from `authStore`
2. **Request**: Attaches `X-API-Key: <pharmacySlug>` for tenant routing
3. **Response**: On a `401` response, calls `authStore.logout()` automatically

You do **not** need to manually attach auth headers.

**Recommended pattern for API calls:**
```tsx
import apiClient from '@/api/client';
import toast from 'react-hot-toast';

const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    const res = await apiClient.post('/some/endpoint', payload);
    // res.data.data is the actual payload
  } catch (err: any) {
    const msg = err.response?.data?.error?.message || 'Something went wrong';
    toast.error(msg);
  } finally {
    setLoading(false);
  }
};
```

---

## 6. Page-by-Page Logic Reference

### Marketplace Pages

---

#### `Home.tsx` — `/`
- On mount: reads `selectedCampus` from `locationStore`
- Fetches pharmacies: `GET /public/pharmacies?university_id=<id>`
- Fetches products: `GET /public/products/search?university_id=<id>`
- Groups products by pharmacy for display sections

**Key state:**
```tsx
pharmacies          // Array of pharmacy objects
productsByPharmacy  // { [pharmacySlug]: Product[] } grouped by store
todayPicks          // Flat highlighted products array
loading             // Boolean skeleton state
searchQuery         // Search input value
showLocationModal   // Campus picker visibility
```

**Navigation:**
- Pharmacy card click → `navigate('/pharmacies/:slug')`
- Product click → `navigate('/pharmacies/:slug/products/:productId')`
- Search submit → `navigate('/search?q=...')`

---

#### `PharmacyStorefront.tsx` — `/pharmacies/:slug`
- Fetches pharmacy info: `GET /public/pharmacies/:slug`
- Fetches products: `GET /public/pharmacies/:slug/products`
- Category tabs filter products client-side
- "Add to Cart" → `cartStore.addItem()` with conflict handling

**Key state:**
```tsx
pharmacy        // Pharmacy profile
products        // All products for this store
categories      // Unique category list derived from products
activeCategory  // Current tab filter
cartConflict    // { show: boolean; newItem: CartItem } — pending add during conflict
```

---

#### `ProductDetail.tsx` — `/pharmacies/:slug/products/:productId`
- Fetches: `GET /public/pharmacies/:slug/products/:productId`
- Quantity is local state
- "Add to Cart" → `cartStore.addItem()` with conflict handling
- If `product.requires_rx === true` → show prescription upload disclaimer (upload happens at checkout)

---

#### `SearchResults.tsx` — `/search`
- Reads `?q=` from URL params
- Fetches: `GET /public/products/search?q=<query>&university_id=<id>`
- Renders matched products with "Add to Cart"

---

#### `Cart.tsx` — `/cart`
- **No API call** — reads entirely from `cartStore`
- `removeItem()`, `updateQuantity()` called inline
- Cart total computed client-side: `items.reduce((sum, i) => sum + i.price * i.quantity, 0)`
- "Proceed to Checkout" → `navigate('/checkout')`

---

#### `Checkout.tsx` — `/checkout`
This is the most complex page. It is a **multi-step flow** driven by a `?step=` URL param.

| Step | Content |
|------|---------|
| 1 | Contact Info — pre-fills from `authStore.customer` if logged in, else shows guest form |
| 2 | Delivery Details — campus, hall, room + saved address picker |
| 3 | Prescription Upload — only shown if cart has `requires_rx: true` items |
| 4 | Payment Method — `'momo'` or `'cash_on_delivery'` |
| 5 | Order Confirmation |

**Order placement:**
1. `POST /tenant/orders` with contact, delivery, payment, items, campus
2. `paymentMethod === 'momo'` → response has `payment_url` → redirect to Paystack
3. `paymentMethod === 'cash_on_delivery'` → navigate to `/orders/:id`
4. On success: `clearCart()` is called

**Do not change the step logic or order placement call.**

---

#### `MyOrders.tsx` — `/orders`
- Fetches: `GET /tenant/orders`
- Lists orders with status badges, each links to `/orders/:id`

---

#### `OrderDetail.tsx` — `/orders/:id`
- Fetches concurrently: `GET /tenant/orders/:id` + `GET /tenant/orders/:id/items`
- Shows order status, item list, payment method, and payment status banner

---

### Rider Portal Pages

---

#### `rider/Login.tsx` — `/rider/login`
- Standalone page, no layout wrapper
- `POST /auth/rider/login` with `{ email, password }`
- On success: `riderStore.login(token, rider)` → navigate to `/rider/dashboard`

---

#### `rider/Dashboard.tsx` — `/rider/dashboard`
- Fetches `GET /rider/orders` on mount and **every 30 seconds** (auto-polling)
- Splits orders client-side:
  - **Pool:** `status === 'shipped'` AND `rider_name === null`
  - **My Active:** `rider_name === rider.name` AND `status === 'shipped' | 'out_for_delivery'`
- "Claim" → `PUT /rider/orders/:id/status { claim: true, rider_id, rider_name, rider_phone }` → refresh
- "Simulate Order" → `POST /rider/orders/simulate` (dev/testing only)

**Key state:**
```tsx
orders          // Raw API response
poolOrders      // Filtered unclaimed
myActiveOrders  // Filtered my active
loading         // Refresh spinner
activeTab       // 'pool' | 'active'
cashInHand      // From riderStore — metric card display
```

---

#### `rider/OrderDetail.tsx` — `/rider/orders/:id`
- Fetches concurrently: `GET /tenant/orders/:id` + `GET /tenant/orders/:id/items`
- Delivery action buttons gated by `order.status`:

```
status === 'shipped'          → "Confirm Picked Up" button
  → PUT /rider/orders/:id/status { status: 'out_for_delivery' }

status === 'out_for_delivery' → "Confirm Delivered" button
  → PUT /rider/orders/:id/status { status: 'delivered' }
  → If payment_method === 'cash_on_delivery': addCash(order.total_amount)
  → navigate('/rider/dashboard')

status === 'delivered'        → Static "Completed" message
status === 'cancelled'        → Static "Cancelled" message
```

**Critical:** When delivery is confirmed as `'delivered'` AND `payment_method === 'cash_on_delivery'`, `addCash(order.total_amount)` MUST be called.

---

#### `rider/Earnings.tsx` — `/rider/earnings`
- Fetches `GET /rider/orders`, filters client-side for `status === 'delivered'` AND `rider_name === rider.name`
- Date range filter re-filters locally — no additional API call
- Commission is **fixed at GHS 8.00 per completed delivery** (hardcoded business rule, not from API)
- "Settle Cash" → `window.confirm()` → `clearCash()`

**Earnings formula:**
```tsx
const commissionPerOrder = 8.00;
const totalEarnings = filteredOrders.length * commissionPerOrder;
```

---

#### `rider/ProfileSettings.tsx` — `/rider/profile`
- Pre-fills from `riderStore.rider`
- Profile update: `PUT /rider/profile` → `riderStore.updateProfile({ name, email, phone })`
- Password change: `PUT /rider/auth/password` (simulated in mock mode)
- Logout: `window.confirm()` → `riderStore.logout()` → navigate to `/rider/login`

---

## 7. Key Business Rules Summary

| Rule | Where It Applies |
|------|----------------|
| Cart is single-pharmacy — returns `conflict: true` on mixed-store add | `cartStore.addItem()` |
| `requires_rx` items require prescription upload at checkout step 3 | `Checkout.tsx` |
| COD deliveries credit `cashInHand` on confirmed delivery | `rider/OrderDetail.tsx` → `addCash()` |
| Commission is fixed at GHS 8.00 per delivery | `rider/Earnings.tsx` |
| Dashboard auto-refreshes every 30 seconds | `rider/Dashboard.tsx` |
| `SINGLE_CAMPUS_MODE = true` locks app to UG Legon campus | `locationStore.ts` |
| Rider auth is entirely separate from customer auth | `riderStore` vs `authStore` |
| `401` from API auto-logs out customer | `api/client.ts` interceptor |

---

## 8. What Must NOT Be Modified

Leave these files untouched to preserve the workflow logic:

- `src/api/client.ts` — Auth interceptors
- `src/api/mock.ts` — Mock data
- `src/store/*.ts` — All Zustand stores
- `src/App.tsx` — Route paths and auth guards
- `src/main.tsx` — Provider setup and mock toggle
- All `src/layouts/` files

For UI-only state (modals, hover, animation), use local `useState` inside your components.

---

## 9. Toasts & Notifications

`react-hot-toast` is already configured globally. Use it anywhere:

```tsx
import toast from 'react-hot-toast';

toast.success('Order placed!');
toast.error('Something went wrong');
toast.loading('Processing...');
```

## 10. Currency Formatting

Use this consistently throughout the app:
```tsx
new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);
// Output: "GHS 8.00"
```
