// Petaca Inventory Types & Interfaces

export type ListingStatus = 'Active' | 'Draft' | 'Sold' | 'Shipped' | 'Archived';

export type ItemCondition = 
  | 'Brand New' 
  | 'Like New' 
  | 'Very Good' 
  | 'Good' 
  | 'Acceptable' 
  | 'For Parts / Repair';

export type ItemCategory = 
  | 'Electronics' 
  | 'Video Games & Consoles' 
  | 'Collectibles' 
  | 'Clothing & Sneakers' 
  | 'Toys & Hobbies' 
  | 'Home & Garden' 
  | 'Jewelry & Watches' 
  | 'Other';

export interface InventoryItem {
  id: string;
  sku: string;
  title: string;
  category: ItemCategory;
  condition: ItemCondition;
  purchaseCost: number; // In USD
  listPrice: number;    // In USD
  quantity: number;
  locationBin: string;  // e.g. "Bin A1", "Shelf B3"
  status: ListingStatus;
  imageUrl: string;
  notes?: string;
  ebayListingId?: string;
  ebayUrl?: string;
  dateAcquired: string; // ISO YYYY-MM-DD
  dateListed?: string;  // ISO YYYY-MM-DD
  weightOz?: number;
}

export interface SaleRecord {
  id: string;
  itemId: string;
  itemTitle: string;
  sku: string;
  salePrice: number;
  purchaseCost: number;
  ebayFeePct: number;    // Default e.g. 13.25%
  ebayFeeFixed: number;  // Default e.g. $0.30
  shippingLabelCost: number;
  netProfit: number;
  buyerUsername: string;
  saleDate: string;      // ISO YYYY-MM-DD
  locationBin: string;
}

export interface StorageBin {
  id: string;
  name: string;        // e.g. "Bin A1"
  location: string;    // e.g. "Garage Shelf 2"
  description: string;
  itemCount?: number;
  totalValue?: number;
}

export interface InventoryStats {
  totalItems: number;
  activeListingsCount: number;
  draftsCount: number;
  soldCount: number;
  totalInvestedCost: number;
  totalActiveListValue: number;
  potentialProfit: number;
  realizedProfitThisMonth: number;
  averageMarginPct: number;
}
