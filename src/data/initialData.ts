import { InventoryItem, SaleRecord, StorageBin } from '../types/inventory';

export const initialBins: StorageBin[] = [
  { id: 'bin-1', name: 'Bin A1', location: 'Top Shelf - Closet A', description: 'Retro Electronics & Handheld Consoles' },
  { id: 'bin-2', name: 'Bin A2', location: 'Middle Shelf - Closet A', description: 'Video Game Discs & Cartridges' },
  { id: 'bin-3', name: 'Bin B1', location: 'Garage Rack 1', description: 'Designer Sneakers & Apparel (Boxed)' },
  { id: 'bin-4', name: 'Bin B2', location: 'Garage Rack 2', description: 'Cameras, Lenses & Audio Equipment' },
  { id: 'bin-5', name: 'Bin C1', location: 'Desk Drawer Safe', description: 'Trading Cards & High-Value Collectibles' },
];

export const initialItems: InventoryItem[] = [
  {
    id: 'item-101',
    sku: 'NA-XXXX-001',
    title: 'Unknown',
    category: 'Other',
    condition: 'Acceptable',
    purchaseCost: 0,
    listPrice: 0,
    quantity: 0,
    locationBin: 'N/A',
    status: 'Draft',
    imageUrl: '',
    notes: '',
    ebayListingId: '0',
    ebayUrl: '',
    dateAcquired: '1999-01-01',
    dateListed: '1999-01-01',
    weightOz: 0
  }
];

export const initialSales: SaleRecord[] = [
  {
    id: 'sale-201',
    itemId: 'item-106',
    itemTitle: 'Nintendo Game Boy Advance SP AGS-101 Pearl Blue (Brighter Screen)',
    sku: 'GME-GBA-SP',
    salePrice: 140.00,
    purchaseCost: 50.00,
    ebayFeePct: 13.25,
    ebayFeeFixed: 0.30,
    shippingLabelCost: 5.20,
    netProfit: 65.65,
    buyerUsername: 'retro_collector_99',
    saleDate: '2026-07-18',
    locationBin: 'Bin A1'
  }
];
