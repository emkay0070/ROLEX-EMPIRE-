import {
  OrderLedgerRecord,
  SaveData,
  ShiftRecord,
  UpgradePurchaseRecord,
} from '../types/game';

const DB_NAME = 'rolex_empire_db';
const DB_VERSION = 1;

export const STORE_PROFILE = 'profile';
export const STORE_SHIFTS = 'shift_history';
export const STORE_ORDERS = 'order_ledger';
export const STORE_UPGRADES = 'upgrade_log';

export interface StoredProfileRecord {
  id: 'active_save';
  schemaVersion: number;
  updatedAt: number;
  migratedFromLocalStorage: boolean;
  data: SaveData;
}

function isIndexedDbSupported(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
  } catch {
    return false;
  }
}

function openDatabase(): Promise<IDBDatabase | null> {
  if (!isIndexedDbSupported()) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(STORE_PROFILE)) {
          db.createObjectStore(STORE_PROFILE, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORE_SHIFTS)) {
          const shiftStore = db.createObjectStore(STORE_SHIFTS, { keyPath: 'id' });
          shiftStore.createIndex('by_timestamp', 'completedAt', { unique: false });
          shiftStore.createIndex('by_shift', 'shiftNumber', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORE_ORDERS)) {
          const orderStore = db.createObjectStore(STORE_ORDERS, { keyPath: 'id' });
          orderStore.createIndex('by_timestamp', 'servedAt', { unique: false });
          orderStore.createIndex('by_recipe', 'recipeId', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORE_UPGRADES)) {
          const upgradeStore = db.createObjectStore(STORE_UPGRADES, { keyPath: 'id' });
          upgradeStore.createIndex('by_timestamp', 'purchasedAt', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

let dbPromise: Promise<IDBDatabase | null> | null = null;

function getDb(): Promise<IDBDatabase | null> {
  if (!dbPromise) {
    dbPromise = openDatabase();
  }
  return dbPromise;
}

function runTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  executor: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> {
  return getDb().then((db) => {
    if (!db) return null;
    return new Promise<T | null>((resolve) => {
      try {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const req = executor(store);
        let resultValue: T | null = null;

        req.onsuccess = () => {
          resultValue = req.result;
        };
        tx.oncomplete = () => resolve(resultValue);
        tx.onerror = () => resolve(null);
        tx.onabort = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  });
}

export async function idbGetProfile(): Promise<StoredProfileRecord | null> {
  const rec = await runTransaction<StoredProfileRecord | undefined>(
    STORE_PROFILE,
    'readonly',
    (store) => store.get('active_save'),
  );
  return rec ?? null;
}

export async function idbPutProfile(record: StoredProfileRecord): Promise<boolean> {
  const res = await runTransaction(STORE_PROFILE, 'readwrite', (store) => store.put(record));
  return res !== null;
}

export async function idbAddShiftRecord(record: ShiftRecord): Promise<boolean> {
  const res = await runTransaction(STORE_SHIFTS, 'readwrite', (store) => store.put(record));
  return res !== null;
}

export async function idbAddOrderRecord(record: OrderLedgerRecord): Promise<boolean> {
  const res = await runTransaction(STORE_ORDERS, 'readwrite', (store) => store.put(record));
  return res !== null;
}

export async function idbAddUpgradeRecord(record: UpgradePurchaseRecord): Promise<boolean> {
  const res = await runTransaction(STORE_UPGRADES, 'readwrite', (store) => store.put(record));
  return res !== null;
}

export async function idbGetAllShifts(): Promise<ShiftRecord[]> {
  const rows = await runTransaction<ShiftRecord[]>(STORE_SHIFTS, 'readonly', (store) =>
    store.getAll(),
  );
  return (rows ?? []).sort((a, b) => b.completedAt - a.completedAt);
}

export async function idbGetAllOrders(limit = 250): Promise<OrderLedgerRecord[]> {
  const rows = await runTransaction<OrderLedgerRecord[]>(STORE_ORDERS, 'readonly', (store) =>
    store.getAll(),
  );
  return (rows ?? []).sort((a, b) => b.servedAt - a.servedAt).slice(0, limit);
}

export async function idbGetAllUpgrades(): Promise<UpgradePurchaseRecord[]> {
  const rows = await runTransaction<UpgradePurchaseRecord[]>(
    STORE_UPGRADES,
    'readonly',
    (store) => store.getAll(),
  );
  return (rows ?? []).sort((a, b) => b.purchasedAt - a.purchasedAt);
}

export async function idbGetCounts(): Promise<{
  shifts: number;
  orders: number;
  upgrades: number;
}> {
  const [shifts, orders, upgrades] = await Promise.all([
    runTransaction<number>(STORE_SHIFTS, 'readonly', (s) => s.count()),
    runTransaction<number>(STORE_ORDERS, 'readonly', (s) => s.count()),
    runTransaction<number>(STORE_UPGRADES, 'readonly', (s) => s.count()),
  ]);
  return {
    shifts: shifts ?? 0,
    orders: orders ?? 0,
    upgrades: upgrades ?? 0,
  };
}

export async function idbClearAllStores(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(
        [STORE_PROFILE, STORE_SHIFTS, STORE_ORDERS, STORE_UPGRADES],
        'readwrite',
      );
      tx.objectStore(STORE_PROFILE).clear();
      tx.objectStore(STORE_SHIFTS).clear();
      tx.objectStore(STORE_ORDERS).clear();
      tx.objectStore(STORE_UPGRADES).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}
