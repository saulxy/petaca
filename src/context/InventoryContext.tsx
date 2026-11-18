import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { InventoryItem, SaleRecord, StorageBin, InventoryStats } from '../types/inventory';
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
import { ensureAnonymousAuth } from '../config/firebase';
import { getStorageItem } from '../services/storageService';

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
  syncLocalDataToCloud: () => Promise<{ itemsSynced: number; salesSynced: number; binsSynced: number }>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Cloud Firestore is the single source of truth
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [bins, setBins] = useState<StorageBin[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedBin, setSelectedBin] = useState('All');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time Cloud Firestore subscriptions (Single Source of Truth)
  useEffect(() => {
    let isSubscribed = true;
    let unsubscribeItems: (() => void) | undefined;
    let unsubscribeSales: (() => void) | undefined;
    let unsubscribeBins: (() => void) | undefined;

    ensureAnonymousAuth()
      .then(() => {
        if (!isSubscribed) return;

        unsubscribeItems = subscribeToItems(
          (firestoreItems) => {
            if (!isSubscribed) return;
            console.log(`🔥 [Firestore Sync] Connected to Cloud Firestore! Loaded ${firestoreItems.length} item(s).`);
            setItems(firestoreItems);
            setFirebaseConnected(true);
            setIsLoading(false);
          },
          (err) => {
            if (!isSubscribed) return;
            console.error(`❌ [Firestore Sync Error] Could not connect to Cloud Firestore (${err.message}).`);
            setFirebaseConnected(false);
            setIsLoading(false);
          }
        );

        unsubscribeSales = subscribeToSales((firestoreSales) => {
          if (!isSubscribed) return;
          setSales(firestoreSales);
        });

        unsubscribeBins = subscribeToBins((firestoreBins) => {
          if (!isSubscribed) return;
          setBins(firestoreBins);
        });
      })
      .catch((err) => {
        if (!isSubscribed) return;
        console.error(`❌ [Firebase Auth Error] Could not authenticate anonymously (${err.message}).`);
        setFirebaseConnected(false);
        setIsLoading(false);
      });

    return () => {
      isSubscribed = false;
      if (unsubscribeItems) unsubscribeItems();
      if (unsubscribeSales) unsubscribeSales();
      if (unsubscribeBins) unsubscribeBins();
    };
  }, []);

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

  // Add New Item to Cloud Firestore
  const addItem = (newItemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...newItemData,
      id: `item-${Date.now()}`
    };

    addItemToFirestore(newItem).catch(err => {
      console.error('Failed to add item to Firestore:', err);
    });
  };

  // Update Item in Cloud Firestore
  const updateItem = (updated: InventoryItem) => {
    updateItemInFirestore(updated).catch(err => {
      console.error('Failed to update item in Firestore:', err);
    });
  };

  // Delete Item from Cloud Firestore
  const deleteItem = (id: string) => {
    deleteItemFromFirestore(id).catch(err => {
      console.error('Failed to delete item from Firestore:', err);
    });
  };

  // Mark Item as Sold in Cloud Firestore
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

    addSaleToFirestore(newSale).catch(err => console.error('Failed to add sale to Firestore:', err));
    updateItem({ ...target, status: 'Sold' });
  };

  // Add Storage Bin to Cloud Firestore
  const addBin = (newBinData: Omit<StorageBin, 'id'>) => {
    const newBin: StorageBin = {
      ...newBinData,
      id: `bin-${Date.now()}`
    };
    addBinToFirestore(newBin).catch(err => console.error('Failed to add bin to Firestore:', err));
  };

  // Sync Local Data (IndexedDB / localStorage) to Cloud Firestore
  const syncLocalDataToCloud = async () => {
    const storedItems = await getStorageItem<InventoryItem[]>('petaca_inventory_items', []);
    const storedSales = await getStorageItem<SaleRecord[]>('petaca_inventory_sales', []);
    const storedBins = await getStorageItem<StorageBin[]>('petaca_inventory_bins', []);

    // Filter out hardcoded mock records from initialData.ts
    const validLocalItems = (storedItems || []).filter(
      item => item && item.id && item.id !== 'item-101'
    );
    const validLocalSales = (storedSales || []).filter(
      sale => sale && sale.id && sale.id !== 'sale-201'
    );
    const validLocalBins = (storedBins || []).filter(
      bin => bin && bin.id
    );

    await Promise.all([
      ...validLocalItems.map(item => addItemToFirestore(item)),
      ...validLocalSales.map(sale => addSaleToFirestore(sale)),
      ...validLocalBins.map(bin => addBinToFirestore(bin))
    ]);

    return {
      itemsSynced: validLocalItems.length,
      salesSynced: validLocalSales.length,
      binsSynced: validLocalBins.length
    };
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
        addBin,
        syncLocalDataToCloud
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

