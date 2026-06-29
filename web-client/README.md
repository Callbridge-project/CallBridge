# CallBridge Web Dashboard — Running & Development Guide

Welcome to the **CallBridge Web Dashboard** project. This repository contains the premium React + TypeScript web frontend for the CallBridge telephony platform. The dashboard enables users to securely monitor real-time Android call logs, SMS activity, and device hardware telemetry.

---

## 1. Quick Start

Follow these steps to get the application running on your local machine.

### Prerequisites
- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher

### Installation
1. Navigate to the project root directory:
   ```bash
   cd callbridge-web
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```

### Running the Development Server
1. Start the Vite local development server:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to the local address displayed in your terminal (usually `http://localhost:5173`).

### Production Build
To compile TypeScript and bundle the application for production:
```bash
# Build the production assets
npm run build

# Preview the production build locally
npm run preview
```

---

## 2. Configuration Modes (Mock vs. Live Backend)

CallBridge features a dual-run architecture configured through the `.env` file in the project root. This allows rapid offline design iteration as well as live integration.

### Environment File (`.env`)
The project comes pre-configured with a `.env` file containing the following variables:
```env
# Set to "true" to use local fixture data instead of Appwrite.
# Set to "false" to connect to the live Appwrite backend.
VITE_USE_MOCK_DATA="true"

# Appwrite Connection Configurations
VITE_APPWRITE_PROJECT_ID="your_appwrite_project_id_here"
VITE_APPWRITE_PROJECT_NAME="Callbridge"
VITE_APPWRITE_ENDPOINT="your_appwrite_endpoint_url_here"
VITE_APPWRITE_DATABASE_ID="your_appwrite_database_id_here"

# Appwrite Collection IDs
VITE_APPWRITE_USERS_COLLECTION_ID="your_users_collection_id_here"
VITE_APPWRITE_CALL_LOGS_COLLECTION_ID="your_call_logs_collection_id_here"
VITE_APPWRITE_SMS_LOGS_COLLECTION_ID="your_sms_logs_collection_id_here"
VITE_APPWRITE_DEVICES_COLLECTION_ID="your_devices_collection_id_here"
VITE_APPWRITE_ACTIVITY_LOGS_COLLECTION_ID="your_activity_logs_collection_id_here"
VITE_APPWRITE_SUPPORT_TICKETS_COLLECTION_ID="your_support_tickets_collection_id_here"
```

### A. Mock Mode (`VITE_USE_MOCK_DATA="true"`)
*   **What it is**: All backend calls are intercepted and served from local state and realistic mock fixtures located in `src/lib/mockdata.ts` and `src/lib/mockDatabase.ts`.
*   **When to use**: Highly recommended for testing UI changes, reviewing layouts, and demonstrating application functionality without needing Appwrite credentials or a working internet connection.
*   **Login & Register Credentials**: 
    *   You can enter **any email and password** on the Login or Register pages. The mock authentication provider will simulate success and log you in.
    *   The default pre-loaded mock user profile is **Kwasi Appiah** (`kwasi@callbridge.io`).

### B. Live Mode (`VITE_USE_MOCK_DATA="false"`)
*   **What it is**: The application establishes connections to the real Appwrite cloud service using the endpoint, database, and collection IDs specified in the `.env` file.
*   **When to use**: Use when testing real-time synchronization from the Android app, creating real user accounts, and conducting end-to-end user acceptance testing (UAT).

---

## 3. Project File Structure

Here is a high-level map of the project to help you navigate the codebase:

```
callbridge-web/
├── .env                         ← Configuration file (Mock toggle lives here)
├── package.json                 ← Scripts, dependencies, and metadata
├── tailwind.config.js           ← Tailwind CSS styling and theme configuration
├── index.html                   ← HTML5 entry point and global header links
├── src/
│   ├── main.tsx                 ← Application mount point and global providers
│   ├── index.css                ← Core design system, font declarations, and global classes
│   ├── router.tsx               ← Route definitions, lazy-loaded subpages, and auth guards
│   ├── assets/
│   │   ├── fonts/               ← Typography assets (Liberation Serif, etc.)
│   │   └── images/              ← Brand logo, phone mockup, and generated laptop mockups
│   ├── components/
│   │   ├── layout/              ← AuthLayout.tsx (shared login/signup) & PageLayout.tsx
│   │   ├── ui/                  ← Reusable inputs, checkboxes, buttons, and card containers
│   │   └── shared/              ← ProtectedRoute wrapper
│   ├── context/
│   │   └── AuthContext.tsx      ← Session restoring, login, logout, and mock authentication
│   ├── hooks/
│   │   └── usePrefetchModules.ts ← Pre-caches dashboard submodules to eliminate navigation lag
│   ├── lib/
│   │   ├── appwrite.ts          ← Appwrite client setup and mock service layer
│   │   ├── mockdata.ts          ← Realistic data fixtures for mock mode
│   │   └── mockDatabase.ts      ← Simulated databases for write and read operations
│   └── pages/                   ← High-Fidelity Page Views
│       ├── LoginPage.tsx        ← Login page utilizing AuthLayout
│       ├── RegisterPage.tsx     ← Sign Up page utilizing AuthLayout
│       ├── DashboardPage.tsx    ← Main stats, live feeds, and terminal widget
│       ├── CallsPage.tsx        ← Grouped call cards and call details modal
│       ├── SmsPage.tsx          ← Message cards with optimistic read states
│       ├── DevicePage.tsx       ← 8-card hardware telemetry grid
│       ├── ActivityLogsPage.tsx ← Vertical activity timeline with filter tags
│       ├── SettingsPage.tsx     ← Unified card view, strength bar, danger zone
│       └── SupportPage.tsx      ← Ticket creation form with upload dropzone
```

---

## 4. Key Design & Styling Guidelines

To maintain the premium visual fidelity of the CallBridge dashboard, all future developers and team members must adhere to these three core styling rules:

### 1. Typography & Hierarchy
*   **Serif Typography**: The custom serif font `font-serif` (*Liberation Serif*) is mapped globally. Use it for major hero headings (e.g., in the Login/Signup branding panels, Device and Support headers).
*   **Bold Texts**: 
    *   The **only** text allowed to use `font-bold` is the main, large hero headings.
    *   **All other bold texts** (card titles, field labels, button labels, and badges) must strictly use `font-semibold` to maintain a balanced, premium typography weight.
    *   Body text should use `font-normal`.

### 2. Solid Crisp Outlines
*   Do not use low-opacity or fuzzy borders for core inputs, checkboxes, or interactive buttons.
*   Always apply the solid global border utility (`border border-global-border`) to forms and cards, ensuring clean, sharp margins.

### 3. Reusable Figma Gradients & Shadows
We have declared three highly polished global classes in `src/index.css` to align with the Figma design specifications. Use them for consistent styling:
*   **`.shadow-badge-blue`**: A soft, premium drop-shadow used on floating badges, information capsules, and dashboard cards.
*   **`.bg-btn-primary-gradient`**: The linear gradient transitioning from primary blue (`#005EA1`) to deep navy (`#21304C`) used on primary action buttons.
*   **`.shadow-btn-primary`**: A double-shadow effect applied to primary action buttons to give them depth.

---

## 5. Development CLI Commands Reference

Here is a list of commands you will use frequently during development:

| Command | Action |
|---------|--------|
| `npm run dev` | Launches the Vite local dev server with Hot Module Replacement (HMR) |
| `npm run build` | Compiles TypeScript and builds production bundles into `/dist` |
| `npm run preview` | Spins up a local server to preview the production build |
| `npm run lint` | Runs ESLint to check for code quality and styling violations |
| `npx tsc --noEmit` | Runs the TypeScript compiler check to verify zero type-safety errors |
