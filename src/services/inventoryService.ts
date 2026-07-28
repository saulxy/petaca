// Firestore CRUD Service Layer for Petaca Inventory
import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { InventoryItem, SaleRecord, StorageBin } from '../types/inventory';

const ITEMS_COLLECTION = 'items';
const SALES_COLLECTION = 'sales';
const BINS_COLLECTION = 'bins';

/**
 * Subscribe to real-time updates for inventory items from Cloud Firestore.
 */
export const subscribeToItems = (
  onSuccess: (items: InventoryItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const itemsRef = collection(db, ITEMS_COLLECTION);
  return onSnapshot(
    itemsRef,
    (snapshot) => {
      const itemsList: InventoryItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          sku: data.sku || '',
          title: data.title || '',
          category: data.category || 'Other',
          condition: data.condition || 'Very Good',
          purchaseCost: Number(data.purchaseCost) || 0,
          listPrice: Number(data.listPrice) || 0,
          quantity: Number(data.quantity) || 1,
          locationBin: data.locationBin || 'Bin A1',
          status: data.status || 'Active',
          imageUrl: data.imageUrl || '',
          images: Array.isArray(data.images) ? data.images : (data.imageUrl ? [data.imageUrl] : []),
          notes: data.notes || '',
          ebayListingId: data.ebayListingId || '',
          ebayUrl: data.ebayUrl || undefined,
          dateAcquired: data.dateAcquired || new Date().toISOString().split('T')[0],
          dateListed: data.dateListed || undefined,
          weightOz: Number(data.weightOz) || 16
        } as InventoryItem;
      });
      onSuccess(itemsList);
    },
    (err) => {
      console.warn('Firestore items snapshot error:', err);
      if (onError) onError(err);
    }
  );
};

/**
 * Fetch all inventory items once from Cloud Firestore.
 */
export const getItemsFromFirestore = async (): Promise<InventoryItem[]> => {
  const itemsRef = collection(db, ITEMS_COLLECTION);
  const snapshot = await getDocs(itemsRef);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<InventoryItem, 'id'>)
  }));
};

/**
 * Utility to strip undefined properties from an object so Firestore setDoc/addDoc never fails.
 */
export const sanitizeForFirestore = <T extends Record<string, any>>(obj: T): T => {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned as T;
};

/**
 * Add a new item to Cloud Firestore.
 */
export const addItemToFirestore = async (
  itemData: Omit<InventoryItem, 'id'> & { id?: string }
): Promise<string> => {
  const docId = itemData.id || `item-${Date.now()}`;
  const docRef = doc(db, ITEMS_COLLECTION, docId);
  
  const rawPayload = {
    ...itemData,
    id: docId,
    notes: itemData.notes || '',
    ebayListingId: itemData.ebayListingId || '',
    ebayUrl: itemData.ebayUrl || '',
    dateListed: itemData.dateListed || '',
    images: Array.isArray(itemData.images) && itemData.images.length > 0
      ? itemData.images
      : (itemData.imageUrl ? [itemData.imageUrl] : []),
    updatedAt: new Date().toISOString()
  };

  const payload = sanitizeForFirestore(rawPayload);
  await setDoc(docRef, payload, { merge: true });
  return docId;
};

/**
 * Update an existing inventory item in Cloud Firestore.
 */
export const updateItemInFirestore = async (item: InventoryItem): Promise<void> => {
  if (!item.id) throw new Error('Item ID is required for updating in Firestore');
  const docRef = doc(db, ITEMS_COLLECTION, item.id);

  const rawPayload = {
    ...item,
    notes: item.notes || '',
    ebayListingId: item.ebayListingId || '',
    ebayUrl: item.ebayUrl || '',
    dateListed: item.dateListed || '',
    images: Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : (item.imageUrl ? [item.imageUrl] : []),
    updatedAt: new Date().toISOString()
  };

  const payload = sanitizeForFirestore(rawPayload);
  await setDoc(docRef, payload, { merge: true });
};

/**
 * Delete an inventory item from Cloud Firestore.
 */
export const deleteItemFromFirestore = async (id: string): Promise<void> => {
  if (!id) return;
  const docRef = doc(db, ITEMS_COLLECTION, id);
  await deleteDoc(docRef);
};

/**
 * Subscribe to real-time sales records from Cloud Firestore.
 */
export const subscribeToSales = (
  onSuccess: (sales: SaleRecord[]) => void
): Unsubscribe => {
  const salesRef = collection(db, SALES_COLLECTION);
  return onSnapshot(
    salesRef,
    (snapshot) => {
      const salesList: SaleRecord[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<SaleRecord, 'id'>)
      }));
      onSuccess(salesList);
    },
    (err) => console.warn('Firestore sales snapshot error:', err)
  );
};

/**
 * Record a new sale in Cloud Firestore.
 */
export const addSaleToFirestore = async (sale: SaleRecord): Promise<void> => {
  const docRef = doc(db, SALES_COLLECTION, sale.id);
  const payload = sanitizeForFirestore(sale as Record<string, any>);
  await setDoc(docRef, payload, { merge: true });
};

/**
 * Subscribe to storage bins from Cloud Firestore.
 */
export const subscribeToBins = (
  onSuccess: (bins: StorageBin[]) => void
): Unsubscribe => {
  const binsRef = collection(db, BINS_COLLECTION);
  return onSnapshot(
    binsRef,
    (snapshot) => {
      const binsList: StorageBin[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<StorageBin, 'id'>)
      }));
      onSuccess(binsList);
    },
    (err) => console.warn('Firestore bins snapshot error:', err)
  );
};

/**
 * Add a new storage bin to Cloud Firestore.
 */
export const addBinToFirestore = async (bin: StorageBin): Promise<void> => {
  const docRef = doc(db, BINS_COLLECTION, bin.id);
  const payload = sanitizeForFirestore(bin as Record<string, any>);
  await setDoc(docRef, payload, { merge: true });
};
