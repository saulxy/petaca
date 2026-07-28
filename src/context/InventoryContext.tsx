import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { InventoryItem, SaleRecord, StorageBin, InventoryStats, ListingStatus } from '../types/inventory';
import { initialItems, initialSales, initialBins } from '../data/initialData';
import {
  subscribeToItems,
  addItemToFirestore,
  updateItemInFirestore,
  deleteItemFromFirestore,
  subscribeToSales,
  addSaleToFirestore,
  subscribeToBins,
  addBinToFirestore
} from '../services/inventoryService';

interface InventoryContextType {
  items: InventoryItem[];
  sales: SaleRecord[];
  bins: StorageBin[];
  searchQuery: string;
  selectedCategory: string;
  selectedStatus: string;
  selectedBin: string;
  isDarkMode: boolean;
  firebaseConnected: boolean;
  isLoading: boolean;
  stats: InventoryStats;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
  setSelectedStatus: (status: string) => void;
  setSelectedBin: (bin: string) => void;
  toggleDarkMode: () => void;
  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateItem: (item: InventoryItem) => void;
  deleteItem: (id: string) => void;
  markAsSold: (itemId: string, salePrice: number, buyerUsername: string, shippingCost: number) => void;
  addBin: (bin: Omit<StorageBin, 'id'>) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence via localStorage or default mock data as initial fallback
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('petaca_inventory_items');
    return saved ? JSON.parse(saved) : initialItems;
  });

  const [sales, setSales] = useState<SaleRecord[]>(() => {
    const saved = localStorage.getItem('petaca_inventory_sales');
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [bins, setBins] = useState<StorageBin[]>(() => {
    const saved = localStorage.getItem('petaca_inventory_bins');
    return saved ? JSON.parse(saved) : initialBins;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedBin, setSelectedBin] = useState('All');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time Cloud Firestore subscription for Items
  useEffect(() => {
    let isSubscribed = true;

    const unsubscribeItems = subscribeToItems(
      (firestoreItems) => {
        if (!isSubscribed) return;
        console.log(`🔥 [Firestore Sync] Successfully connected to Cloud Firestore! Loaded ${firestoreItems.length} item(s).`);
        if (firestoreItems && firestoreItems.length > 0) {
          setItems(firestoreItems);
        }
        setFirebaseConnected(true);
        setIsLoading(false);
      },
      (err) => {
        if (!isSubscribed) return;
        console.warn(`⚠️ [Firestore Sync Warning] Could not connect to Cloud Firestore (${err.message}). Using local storage fallback.`);
        setFirebaseConnected(false);
        setIsLoading(false);
      }
    );

    const unsubscribeSales = subscribeToSales((firestoreSales) => {
      if (!isSubscribed) return;
      if (firestoreSales && firestoreSales.length > 0) {
        setSales(firestoreSales);
      }
    });

    const unsubscribeBins = subscribeToBins((firestoreBins) => {
      if (!isSubscribed) return;
      if (firestoreBins && firestoreBins.length > 0) {
        setBins(firestoreBins);
      }
    });

    return () => {
      isSubscribed = false;
      unsubscribeItems();
      unsubscribeSales();
      unsubscribeBins();
    };
  }, []);

  // Sync to localStorage as offline cache
  useEffect(() => {
    localStorage.setItem('petaca_inventory_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('petaca_inventory_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('petaca_inventory_bins', JSON.stringify(bins));
  }, [bins]);

  // Dark Mode side effect
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.body.classList.add('light-theme');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Calculate live statistics
  const stats: InventoryStats = useMemo(() => {
    const activeItems = items.filter(i => i.status === 'Active');
    const draftItems = items.filter(i => i.status === 'Draft');
    const soldItems = items.filter(i => i.status === 'Sold');

    const totalInvestedCost = items.reduce((acc, curr) => acc + (curr.purchaseCost * curr.quantity), 0);
    const totalActiveListValue = activeItems.reduce((acc, curr) => acc + (curr.listPrice * curr.quantity), 0);
    
    // Estimated profit on active items (assuming 13.25% eBay fee + $0.30)
    const potentialProfit = activeItems.reduce((acc, curr) => {
      const estimatedFee = (curr.listPrice * 0.1325) + 0.30;
      const netUnit = curr.listPrice - curr.purchaseCost - estimatedFee;
      return acc + (netUnit * curr.quantity);
    }, 0);

    const realizedProfitThisMonth = sales.reduce((acc, curr) => acc + curr.netProfit, 0);

    const averageMarginPct = totalActiveListValue > 0
      ? ((potentialProfit / totalActiveListValue) * 100)
      : 0;

    return {
      totalItems: items.length,
      activeListingsCount: activeItems.length,
      draftsCount: draftItems.length,
      soldCount: soldItems.length + sales.length,
      totalInvestedCost,
      totalActiveListValue,
      potentialProfit,
      realizedProfitThisMonth,
      averageMarginPct: Math.max(0, Math.round(averageMarginPct * 10) / 10)
    };
  }, [items, sales]);

  // Add New Item to Cloud Firestore & Local State
  const addItem = (newItemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...newItemData,
      id: `item-${Date.now()}`
    };
    // Optimistic UI update
    setItems(prev => [newItem, ...prev]);

    // Persist to Cloud Firestore
    addItemToFirestore(newItem).catch(err => {
      console.error('Failed to add item to Firestore:', err);
    });
  };

  // Update Item in Cloud Firestore & Local State
  const updateItem = (updated: InventoryItem) => {
    // Optimistic UI update
    setItems(prev => prev.map(item => item.id === updated.id ? updated : item));

    // Persist to Cloud Firestore
    updateItemInFirestore(updated).catch(err => {
      console.error('Failed to update item in Firestore:', err);
    });
  };

  // Delete Item from Cloud Firestore & Local State
  const deleteItem = (id: string) => {
    // Optimistic UI update
    setItems(prev => prev.filter(item => item.id !== id));

    // Persist to Cloud Firestore
    deleteItemFromFirestore(id).catch(err => {
      console.error('Failed to delete item from Firestore:', err);
    });
  };

  // Mark Item as Sold
  const markAsSold = (
    itemId: string, 
    salePrice: number, 
    buyerUsername: string, 
    shippingCost: number
  ) => {
    const target = items.find(i => i.id === itemId);
    if (!target) return;

    const feePct = 13.25;
    const feeFixed = 0.30;
    const feeTotal = (salePrice * (feePct / 100)) + feeFixed;
    const netProfit = Math.round((salePrice - target.purchaseCost - feeTotal - shippingCost) * 100) / 100;

    const newSale: SaleRecord = {
      id: `sale-${Date.now()}`,
      itemId: target.id,
      itemTitle: target.title,
      sku: target.sku,
      salePrice,
      purchaseCost: target.purchaseCost,
      ebayFeePct: feePct,
      ebayFeeFixed: feeFixed,
      shippingLabelCost: shippingCost,
      netProfit,
      buyerUsername: buyerUsername || 'ebay_buyer',
      saleDate: new Date().toISOString().split('T')[0],
      locationBin: target.locationBin
    };

    setSales(prev => [newSale, ...prev]);
    addSaleToFirestore(newSale).catch(err => console.error('Failed to add sale to Firestore:', err));

    updateItem({ ...target, status: 'Sold' });
  };

  // Add Storage Bin to Cloud Firestore & Local State
  const addBin = (newBinData: Omit<StorageBin, 'id'>) => {
    const newBin: StorageBin = {
      ...newBinData,
      id: `bin-${Date.now()}`
    };
    setBins(prev => [...prev, newBin]);
    addBinToFirestore(newBin).catch(err => console.error('Failed to add bin to Firestore:', err));
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        sales,
        bins,
        searchQuery,
        selectedCategory,
        selectedStatus,
        selectedBin,
        isDarkMode,
        firebaseConnected,
        isLoading,
        stats,
        setSearchQuery,
        setSelectedCategory,
        setSelectedStatus,
        setSelectedBin,
        toggleDarkMode,
        addItem,
        updateItem,
        deleteItem,
        markAsSold,
        addBin
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

