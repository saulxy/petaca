import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { auth, databaseId, db, ensureAnonymousAuth } from '../../config/firebase';
import {
  addItemToFirestore,
  getItemsFromFirestore,
  deleteItemFromFirestore
} from '../inventoryService';
import { InventoryItem } from '../../types/inventory';

describe('Firebase Inventory Service (petaca-dev)', () => {
  const testItemId = `test-item-${Date.now()}`;

  beforeAll(async () => {
    await ensureAnonymousAuth();
  });

  afterAll(async () => {
    // Clean up test item from petaca-dev after test completes
    await deleteItemFromFirestore(testItemId);
  });

  it('points strictly to the petaca-dev Firestore database and signs in anonymously', () => {
    expect(databaseId).toBe('petaca-dev');
    expect((db as any)._databaseId?.database).toBe('petaca-dev');
    expect(auth.currentUser).not.toBeNull();
  });

  it('creates an item and loads it from the petaca-dev database in Firebase', async () => {
    const newItem: InventoryItem = {
      id: testItemId,
      sku: 'TEST-SKU-001',
      title: 'Unit Test Item - Game Boy Color',
      category: 'Video Games & Consoles',
      condition: 'Very Good',
      purchaseCost: 25.0,
      listPrice: 75.0,
      quantity: 1,
      locationBin: 'Bin A1',
      status: 'Active',
      imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
      images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80'],
      notes: 'Created by automated unit test',
      ebayListingId: '1234567890',
      ebayUrl: 'https://www.ebay.com/itm/1234567890',
      dateAcquired: '2026-11-17',
      dateListed: '2026-11-17',
      weightOz: 12
    };

    // 1. Create the item in Firestore (petaca-dev)
    const createdId = await addItemToFirestore(newItem);
    expect(createdId).toBe(testItemId);

    // 2. Load items from Firestore (petaca-dev) and verify the item exists
    const loadedItems = await getItemsFromFirestore();
    const loadedItem = loadedItems.find((item) => item.id === testItemId);

    expect(loadedItem).toBeDefined();
    expect(loadedItem?.title).toBe(newItem.title);
    expect(loadedItem?.sku).toBe(newItem.sku);
    expect(loadedItem?.category).toBe(newItem.category);
    expect(loadedItem?.purchaseCost).toBe(newItem.purchaseCost);
    expect(loadedItem?.listPrice).toBe(newItem.listPrice);
    expect(loadedItem?.locationBin).toBe(newItem.locationBin);
  }, 15000);
});
