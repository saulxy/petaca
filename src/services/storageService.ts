/**
 * Storage Service combining IndexedDB (for large storage capacity, 500MB+)
 * with a fallback sync to localStorage protected by try/catch blocks to eliminate
 * QuotaExceededError crashes completely.
 */

const DB_NAME = 'PetacaDB';
const DB_VERSION = 1;
const STORE_NAME = 'appData';

let dbPromise: Promise<IDBDatabase> | null = null;

const getDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event: Event) => {
      console.warn('IndexedDB failed to open:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });

  return dbPromise;
};

/**
 * Get an item from IndexedDB.
 */
export const getIDBItem = async <T>(key: string): Promise<T | null> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result !== undefined ? (request.result as T) : null);
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    console.warn(`IDB read error for ${key}:`, err);
    return null;
  }
};

/**
 * Save an item to IndexedDB.
 */
export const setIDBItem = async <T>(key: string, value: T): Promise<void> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn(`IDB write error for ${key}:`, err);
  }
};

/**
 * Helper function to safely set item in localStorage without throwing QuotaExceededError.
 */
export const safeSetLocalStorage = (key: string, value: any): boolean => {
  try {
    const jsonString = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, jsonString);
    return true;
  } catch (err: any) {
    if (
      err &&
      (err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err.code === 22 ||
        err.code === 1014)
    ) {
      console.warn(`⚠️ [Storage Warning] localStorage quota exceeded for key '${key}'. Handled safely. Data is stored in IndexedDB.`);

      // Attempt fallback: strip heavy base64 data URLs from localStorage items if storing inventory
      if (Array.isArray(value)) {
        try {
          const sanitized = value.map(item => {
            if (item && typeof item === 'object') {
              const cleaned = { ...item };
              if (cleaned.imageUrl && cleaned.imageUrl.startsWith('data:')) {
                cleaned.imageUrl = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
              }
              if (Array.isArray(cleaned.images)) {
                cleaned.images = cleaned.images.map((img: string) =>
                  img.startsWith('data:')
                    ? 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80'
                    : img
                );
              }
              return cleaned;
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(sanitized));
          return true;
        } catch {
          // If sanitized save still fails, silently ignore to prevent breaking the UI
        }
      }
    } else {
      console.warn(`localStorage setItem error for '${key}':`, err);
    }
    return false;
  }
};

/**
 * Save data to both IndexedDB (primary reliable high-capacity store)
 * and localStorage (secondary fallback, quota protected).
 */
export const setStorageItem = async <T>(key: string, value: T): Promise<void> => {
  // Save to IndexedDB (asynchronous high-capacity storage)
  await setIDBItem(key, value);

  // Sync to localStorage safely
  safeSetLocalStorage(key, value);
};

/**
 * Load data checking IndexedDB first, with localStorage fallback.
 */
export const getStorageItem = async <T>(key: string, defaultValue: T): Promise<T> => {
  // 1. Try reading from IndexedDB
  const idbData = await getIDBItem<T>(key);
  if (idbData !== null && idbData !== undefined) {
    return idbData;
  }

  // 2. Fallback to localStorage if IndexedDB returns null
  try {
    const localData = localStorage.getItem(key);
    if (localData) {
      const parsed = JSON.parse(localData) as T;
      // Backfill to IndexedDB for future fast reads
      setIDBItem(key, parsed);
      return parsed;
    }
  } catch (err) {
    console.warn(`localStorage read error for '${key}':`, err);
  }

  return defaultValue;
};
