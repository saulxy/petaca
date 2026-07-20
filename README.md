# Petaca 📦

Personal inventory manager designed specifically for eBay sellers and collectible reselling. Track your physical storage bin locations, calculate real-time net profit margins (factoring eBay final value fees and shipping costs), and manage active listings, drafts, and sold inventory.

---

## 🛠️ Technology Stack

- **Framework**: [Ionic Framework v8](https://ionicframework.com/) (`@ionic/react` v8)
- **Library**: React 18 & React Router v5
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Icons**: [Ionicons](https://ionic.io/ionicons) v7 & Lucide React

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18 or higher) and **npm** installed on your system.

### 1. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

> **Note for Windows PowerShell Users**: If script execution policies block `npm`, run via CMD:
> ```cmd
> cmd /c npm install
> ```

---

## 🏃 Running the App Locally

To start the local Vite development server:

```bash
npm run dev
```

Once started, open your browser at:
`http://localhost:3000/`

---

## 🏗️ Building for Production

To perform type-checking (`tsc`) and bundle the app for production:

```bash
npm run build
```

The compiled static assets will be output to the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

---

## ✨ Key Features

- **📊 Metrics Dashboard**: View total active listing value, invested capital, estimated potential profit, realized sales profit, and average margin %.
- **📦 Inventory Manager**: Filter by status (*Active, Draft, Sold*), storage bin, or category. Live search by SKU, title, location, or serial notes. Toggle between Grid and Compact List views.
- **🧮 Live Net Profit Calculator**: Automatic ROI and net profit estimation based on cost, list price, and eBay fee formulas (13.25% + $0.30 fixed).
- **📍 Storage Bin Organizer**: Track item counts, total value, and physical location per shelf or storage bin (e.g. *Bin A1*, *Shelf B3*).
- **💰 Sales Log & Ledger**: Log sold items with final sale prices, buyer usernames, shipping costs, and eBay fees to track net realized income.
- **🌙 Dark / Light Mode**: Deep obsidian dark theme with eBay brand accents and one-click light/dark theme toggle.
