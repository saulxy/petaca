# Implementation Plan - Ionic v8 eBay Inventory Manager App ("Petaca")

Create a modern, feature-packed Ionic v8 web application for managing personal inventory for an eBay store ("Petaca"). The app will feature an intuitive mobile-first & responsive desktop layout, dashboard metrics, inventory item CRUD management, live profit margin calculators, storage bin tracking, sales log, dark/light theme switching, and sample inventory data.

## User Review Required

> [!IMPORTANT]
> **Tech Stack Choice**: We will initialize the skeleton using **React + Vite + TypeScript** paired with **`@ionic/react` v8** and **Ionicons**. This combination delivers lightning-fast build speeds, full Ionic v8 mobile & web UI components, and clean component modularity.

> [!NOTE]
> The app will be set up directly in the current workspace `c:\Users\im_sa_sy8qn1m\dev_workspace\petaca`.

## Open Questions

- None at present. Default choices follow modern Ionic 8 best practices with sample data pre-loaded for immediate demonstration.

## Proposed Changes

### Project Setup & Configuration

#### [NEW] [package.json](file:///c:/Users/im_sa_sy8qn1m/dev_workspace/petaca/package.json)
- Define dependencies: `@ionic/react` (^8.0.0), `@ionic/react-router` (^8.0.0), `ionicons` (^7.0.0), `react`, `react-dom`, `react-router-dom` (^5.3.4), `lucide-react`, `vite`.

#### [NEW] [vite.config.ts](file:///c:/Users/im_sa_sy8qn1m/dev_workspace/petaca/vite.config.ts)
- Configure Vite build tools and React plugin.

#### [NEW] [tsconfig.json](file:///c:/Users/im_sa_sy8qn1m/dev_workspace/petaca/tsconfig.json)
- TypeScript configuration tailored for React and Ionic.

---

### Core Design System & Styling

#### [NEW] [src/theme/variables.css](file:///c:/Users/im_sa_sy8qn1m/dev_workspace/petaca/src/theme/variables.css)
- Custom Ionic v8 CSS variables defining primary color tokens, obsidian dark mode, eBay brand accents, custom glassmorphism cards, and micro-animation keyframes.

#### [NEW] [src/theme/custom.css](file:///c:/Users/im_sa_sy8qn1m/dev_workspace/petaca/src/theme/custom.css)
- Utility classes, responsive layout grids, custom badge styling, and mobile bottom sheet tweaks.

---

### Application Architecture & Components

#### [NEW] [src/types/inventory.ts](file:///c:/Users/im_sa_sy8qn1m/dev_workspace/petaca/src/types/inventory.ts)
- TypeScript interfaces for `InventoryItem`, `SaleRecord`, `StorageBin`, `InventoryStats`, `FilterOptions`, `ItemCondition`, and `ListingStatus`.

#### [NEW] [src/data/initialData.ts](file:///c:/Users/im_sa_sy8qn1m/dev_workspace/petaca/src/data/initialData.ts)
- Rich mock inventory items (e.g. vintage video games, electronics, collectibles, designer shoes, trading cards) with purchase costs, listed prices, SKU numbers, storage bins, photos, and status.

#### [NEW] [src/context/InventoryContext.tsx](file:///c:/Users/im_sa_sy8qn1m/dev_workspace/petaca/src/context/InventoryContext.tsx)
- React State Context managing inventory CRUD actions, local storage persistence, search query, filter criteria, stats calculation, and theme toggle.

---

### Views & Pages (Ionic v8 Tabs Structure)

#### [NEW] [src/pages/DashboardTab.tsx](file:///c:/Users/im_sa_sy8qn1m/dev_workspace/petaca/src/pages/DashboardTab.tsx)
- High-level inventory metrics dashboard (Total Value, Active Items, Total Investment, Est. Net Profit, Average Margin %).
- Quick stats cards, low stock alerts, recent sales stream, and quick item creation shortcut.

#### [NEW] [src/pages/InventoryTab.tsx](file:///c:/Users/im_sa_sy8qn1m/dev_workspace/petaca/src/pages/InventoryTab.tsx)
- Main inventory view with Ionic Searchbar, Status segment filter (All / Active / Draft / Sold), Bin filter, and sorting.
- Interactive list and grid view options displaying item cards with profit calculator pills and status tags.

#### [NEW] [src/pages/BinsTab.tsx](file:///c:/Users/im_sa_sy8qn1m/dev_workspace/petaca/src/pages/BinsTab.tsx)
- Storage Location Manager showing bin names, locations (e.g. "Shelf A - Bin 3"), assigned item count, total bin value, and quick filter by bin.

#### [NEW] [src/pages/SalesTab.tsx](file:///c:/Users/im_sa_sy8qn1m/dev_workspace/petaca/src/pages/SalesTab.tsx)
- Sales tracking log with realized net profit, eBay fees breakdown, buyer tracking, and date of sale.

---

### Modals & Dialogs

#### [NEW] [src/components/ItemModal.tsx](file:///c:/Users/im_sa_sy8qn1m/dev_workspace/petaca/src/components/ItemModal.tsx)
- Ionic Modal (`IonModal`) for creating/editing an inventory item.
- Real-time ROI and Net Profit preview calculator based on sale price, cost, and eBay fee percentage (13.25% + $0.30 default).

#### [NEW] [src/components/ItemDetailModal.tsx](file:///c:/Users/im_sa_sy8qn1m/dev_workspace/petaca/src/components/ItemDetailModal.tsx)
- Comprehensive view modal for detailed item breakdown, profit breakdown, eBay link, bin info, and action buttons.

---

### Application Entry Point

#### [NEW] [src/App.tsx](file:///c:/Users/im_sa_sy8qn1m/dev_workspace/petaca/src/App.tsx)
- Main `IonApp` layout with `IonReactRouter`, `IonTabs`, `IonTabBar`, `IonTabButton`, and Ionic 8 setup.

#### [NEW] [src/main.tsx](file:///c:/Users/im_sa_sy8qn1m/dev_workspace/petaca/src/main.tsx)
- Vite entry file rendering `<App />`.

#### [NEW] [index.html](file:///c:/Users/im_sa_sy8qn1m/dev_workspace/petaca/index.html)
- HTML entry with viewports, Inter font loading, meta tags, and Ionic theme initialization.

## Verification Plan

### Automated Tests
- Run `npm run build` or `npx tsc --noEmit` to verify type safety and build integrity.

### Manual Verification
- Start the local dev server (`npm run dev`) and test interface responsiveness on mobile & desktop viewport sizes.
- Verify tab navigation (`Dashboard`, `Inventory`, `Storage Bins`, `Sales Log`).
- Verify item creation, editing, deleting, status changes, and live profit calculations.
- Test searching and filtering by category, bin, and status.
